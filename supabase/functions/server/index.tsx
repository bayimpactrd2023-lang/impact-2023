// @ts-ignore - Deno resolves npm: specifiers; TS language server may not be configured for Deno.
import { Hono } from "npm:hono";
// @ts-ignore - Deno resolves npm: specifiers; TS language server may not be configured for Deno.
import { cors } from "npm:hono/cors";
// @ts-ignore - Deno resolves npm: specifiers; TS language server may not be configured for Deno.
import { logger } from "npm:hono/logger";
// @deno-types="https://esm.sh/@supabase/supabase-js@2?dts"
// @ts-ignore - Remote URL imports are resolved by Deno; TS language server may not be configured for them.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Request tracing (helps debug route matching in production)
app.use("*", async (c: any, next: any) => {
  const method = c.req.method;
  const path = c.req.path;
  const contentType = c.req.header("content-type") || "";
  const hasAuth = Boolean(c.req.header("authorization"));
  console.log("[Request]", { method, path, contentType, hasAuth });
  await next();
  console.log("[Response]", { method, path, status: c.res.status });
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Explicit preflight handler for R2 proxy routes (ensures browser preflight gets HTTP 200/204)
app.options("/server/r2/*", (c: any) => c.text("", 204));

// Health check endpoint
app.get("/health", (c: any) => {
  return c.json({ status: "ok" });
});

async function requireUser(c: any) {
  const authHeader = c.req.header("authorization");
  if (!authHeader) {
    console.error("[Auth] No authorization header");
    return null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  // Use SERVICE_ROLE_KEY for JWT verification to bypass RLS/permission issues during debug
  const anonKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  if (!supabaseUrl || !anonKey) {
    console.error("[Auth] Missing SUPABASE_URL or keys in environment");
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Create a temporary client just for this request's verification
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    // Verify the user via the JWT token directly
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error("[Auth] getUser verification failed:", error.message);
      return null;
    }
    
    if (!user) {
      console.error("[Auth] No user found for this token");
      return null;
    }

    console.log("[Auth] User verified successfully:", user.id);
    return user;
  } catch (err) {
    console.error("[Auth] Unexpected error during verification:", err);
    return null;
  }
}

function getWorkerConfig() {
  const workerUrl = (Deno.env.get("R2_WORKER_URL") || "").replace(/\/$/, "");
  const workerToken = (Deno.env.get("R2_WORKER_TOKEN") || "").trim();
  if (!workerUrl) throw new Error("Missing R2_WORKER_URL");
  if (!workerToken) throw new Error("Missing R2_WORKER_TOKEN");
  return { workerUrl, workerToken };
}

// Authenticated proxy for uploads/deletes (keeps Worker token secret)
app.put("/server/r2/*", async (c: any) => {
  const user = await requireUser(c);
  if (!user) return c.text("Unauthorized", 401);

  const key = c.req.path.replace("/server/r2/", "");
  if (!key) return c.text("Missing key", 400);

  const { workerUrl, workerToken } = getWorkerConfig();
  const contentType = c.req.header("content-type") || "application/octet-stream";

  const targetUrl = `${workerUrl}/${key}`;
  console.log("[R2 Proxy] PUT", { key, targetUrl, contentType });

  const resp = await fetch(targetUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      Authorization: `Bearer ${workerToken}`,
    },
    body: c.req.raw.body,
  });

  const respText = await resp.clone().text().catch(() => "");
  console.log("[R2 Proxy] PUT response", {
    status: resp.status,
    statusText: resp.statusText,
    bodyPreview: respText.slice(0, 500),
  });

  const body = await resp.arrayBuffer();
  const headers = new Headers(resp.headers);
  // Remove upstream CORS headers to prevent browser conflicts with Hono's CORS middleware
  headers.delete("access-control-allow-origin");
  headers.delete("access-control-allow-methods");
  headers.delete("access-control-allow-headers");
  
  return new Response(body, {
    status: resp.status,
    headers: headers,
  });
});

app.delete("/server/r2/*", async (c: any) => {
  const authHeader = c.req.header("authorization") || "";
  if (!authHeader) {
    return c.json({ code: 401, message: "Missing Authorization header" }, 401);
  }

  const user = await requireUser(c);
  if (!user) {
    return c.json({ code: 401, message: "Invalid JWT or session expired" }, 401);
  }

  const key = c.req.path.replace("/server/r2/", "");
  if (!key) return c.json({ code: 400, message: "Missing key" }, 400);

  const { workerUrl, workerToken } = getWorkerConfig();

  const targetUrl = `${workerUrl}/${key}`;
  console.log("[R2 Proxy] DELETE", { key, targetUrl });

  const resp = await fetch(targetUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${workerToken}`,
    },
  });

  const respText = await resp.clone().text().catch(() => "");
  console.log("[R2 Proxy] DELETE response", {
    status: resp.status,
    statusText: resp.statusText,
    bodyPreview: respText.slice(0, 500),
  });

  const body = await resp.arrayBuffer();
  const headers = new Headers(resp.headers);
  // Remove upstream CORS headers to prevent browser conflicts with Hono's CORS middleware
  headers.delete("access-control-allow-origin");
  headers.delete("access-control-allow-methods");
  headers.delete("access-control-allow-headers");
  
  return new Response(body, {
    status: resp.status,
    headers: headers,
  });
});

// Catch-all to surface unexpected 404s (route mismatch)
app.all("*", (c: any) => {
  console.log("[Route] Unmatched", { method: c.req.method, path: c.req.path });
  return c.text("Not Found", 404);
});

Deno.serve(app.fetch);