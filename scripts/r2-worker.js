// Cloudflare Worker for R2 Upload Proxy
// Deploy this to your Cloudflare account to bypass CORS issues

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const isReadRequest = request.method === 'GET' || request.method === 'HEAD';

    const corsAllowOrigin = getAllowedOrigin(request, env);
    const corsHeaders = buildCorsHeaders(corsAllowOrigin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'PUT, GET, HEAD, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // For read requests, allow direct browser navigation / image loads that omit the Origin header.
    // For write requests from Edge Function (no Origin header), allow if properly authorized
    if (!corsAllowOrigin && !isReadRequest) {
      // Allow Edge Function proxy requests if they have valid WORKER_TOKEN
      const auth = request.headers.get('Authorization') || '';
      const expected = (env.WORKER_TOKEN || '').trim();
      const match = auth.match(/^Bearer\s+(.+)$/i);
      const hasValidToken = match && match[1] === expected;

      if (!hasValidToken) {
        return new Response('CORS origin not allowed', {
          status: 403,
          headers: {
            ...corsHeaders,
          },
        });
      }
    }

    // Require auth only for write operations.
    if (!isReadRequest && !isAuthorized(request, env)) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          ...corsHeaders,
        },
      });
    }

    try {
      const key = url.pathname.slice(1); // Remove leading /

      if (!key) {
        return new Response('Missing key', { status: 400, headers: { ...corsHeaders } });
      }

      // Upload / delete / check existence in R2
      const bucket = env.IMPACT_IMAGES_BUCKET;

      if (request.method === 'PUT') {
        await bucket.put(key, request.body, {
          httpMetadata: {
            contentType: request.headers.get('content-type') || 'application/octet-stream',
          },
        });

        return new Response(JSON.stringify({
          success: true,
          key,
          url: `${env.PUBLIC_URL}/${key}`,
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      if (request.method === 'DELETE') {
        await bucket.delete(key);
        return new Response(JSON.stringify({ success: true, key }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      if (request.method === 'GET') {
        const object = await bucket.get(key);
        if (!object) {
          return new Response('Not found', { status: 404, headers: { ...corsHeaders } });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
        return new Response(object.body, { status: 200, headers });
      }

      if (request.method === 'HEAD') {
        const object = await bucket.head(key);
        if (!object) {
          return new Response('Not found', { status: 404, headers: { ...corsHeaders } });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
        return new Response(null, { status: 200, headers });
      }

      return new Response('Method not allowed', { status: 405, headers: { ...corsHeaders } });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};

function buildCorsHeaders(allowedOrigin) {
  if (!allowedOrigin) return {};
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
  };
}

function getAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;

  const allowListRaw = (env.CORS_ALLOWED_ORIGINS || '').trim();
  if (!allowListRaw) return null;
  if (allowListRaw === '*') return '*';

  const allowList = allowListRaw.split(',').map((s) => s.trim()).filter(Boolean);
  return allowList.includes(origin) ? origin : null;
}

function isAuthorized(request, env) {
  const expected = (env.WORKER_TOKEN || '').trim();
  if (!expected) return true; // Token optional

  const auth = request.headers.get('Authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return match[1] === expected;
}
