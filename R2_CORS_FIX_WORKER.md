# R2 CORS Fix - Cloudflare Worker Deployment

## Problem
Cloudflare R2 dashboard CORS configuration isn't working.

## Solution
Deploy a Cloudflare Worker that acts as a proxy with proper CORS headers.

## Deployment Steps (5 minutes)

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```
This will open a browser window to authenticate.

### Step 3: Create Worker
```bash
cd scripts
wrangler init r2-upload-proxy
```
Select "No" for TypeScript, "No" for git, "Yes" for deploying.

### Step 4: Copy Worker Code
Replace the contents of `r2-upload-proxy/src/index.js` with the code from `r2-worker.js`.

### Step 5: Configure wrangler.toml
Create `r2-upload-proxy/wrangler.toml`:

```toml
name = "r2-upload-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "IMPACT_IMAGES_BUCKET"
bucket_name = "impact-images"

[vars]
PUBLIC_URL = "https://pub-8b56794b58394e41ae27218e680449f7.r2.dev"
```

### Step 6: Deploy
```bash
cd r2-upload-proxy
wrangler deploy
```

### Step 7: Get Worker URL
After deployment, you'll see a URL like:
```
https://r2-upload-proxy.your-account.workers.dev
```

Copy this URL for the next step.

### Step 8: Update Frontend Code

Edit `src/utils/r2Upload.ts` and replace the upload function to use the Worker:

```typescript
export async function uploadImageToR2(
  file: File,
  folder: string = 'images'
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

    // Use Worker proxy instead of direct R2 upload
    const workerUrl = 'https://r2-upload-proxy.your-account.workers.dev'; // Replace with your URL
    
    const response = await fetch(`${workerUrl}/${fileName}`, {
      method: 'PUT',
      body: await file.arrayBuffer(),
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[R2] Upload successful:`, result.url);
    
    return result.url;
  } catch (error) {
    console.error('[R2] Upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

## Alternative: API Token Approach

If you prefer not to use Workers, try setting CORS via API:

### Step 1: Create API Token
```
https://dash.cloudflare.com/
→ My Profile
→ API Tokens
→ Create Token
→ Use "Custom token"
→ Permissions:
  - Account: R2 Storage: Edit
  - Zone: None
→ Account Resources: Include your account
→ Continue to summary
→ Create Token
```

### Step 2: Run API Command
Replace `YOUR_API_TOKEN` with your actual token:

```bash
curl -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/28eec24bb9bab22e118ae4ba787be7e2/r2/buckets/impact-images/cors" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"AllowedOrigins":["*"],"AllowedMethods":["GET","PUT","POST","DELETE","HEAD"],"AllowedHeaders":["*"],"MaxAgeSeconds":86400}]'
```

## Verification

After deployment:
1. Restart dev server: `npm run dev`
2. Try uploading an image
3. Check console for: `[R2] Upload successful`

## Need Help?

If the Worker approach is too complex, the simplest fix is to:
1. Continue using Supabase Storage for uploads (it already works)
2. Only migrate existing images to R2 manually
3. Set R2 public URL for serving only

This gives you 80% of the cost savings with minimal effort.
