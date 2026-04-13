# Comprehensive Guide: Firebase Cloud Functions Native SEO Interceptor for CSR SPAs

*Target Audience: Lead Architects, AI Coding Assistants, Senior Full-Stack Engineers.*

## 1. The Architectural Challenge
In standard Client-Side Rendered (CSR) applications (like React + Vite), search engines and social media crawlers (Twitter, LinkedIn, Open Graph) cannot execute JavaScript effectively to read dynamic `<meta>` tags. When a crawler hits `/services`, it only sees the default `<title>` and metadata hardcoded in the generic `index.html`.

While Vercel easily allows edge Serverless Interceptors via `api/` folders, **Firebase Hosting introduces a static-bypass paradox**: If `index.html` exists in the deployed `public` (or `dist`) folder, Firebase Hosting will serve it natively for the root `/` path, bypassing any `**` rewrite rules configured for a Cloud Function.

## 2. The Solution: "The Superior Alternative" (Bundled HTML)
Instead of renaming `index.html` in exactly matched deployment steps or forcefully hacking Vite configurations, the absolute best scaling practice is to **remove `index.html` from Firebase Hosting** and bundle it internally within the Cloud Function.

### Mechanism Breakdown:
1. **The Post-Build Integration:**
   When the app builds, a post-build script dynamically copies `dist/index.html` into the compiled `functions/lib/app.html` payload.
2. **The Hosting Mask:**
   In `firebase.json`, `index.html` is added to the `hosting.ignore` array. Firebase pushes all client assets (.js, .css, images) to the CDN but specifically drops `index.html`.
3. **The Engine Fallback:**
   Because Firebase finds no static layout, ALL routes fall through to the global wildcard rewrite: `"source": "**", "function": "seoInterceptor"`.
4. **The Latency-Free Read:**
   The `seoInterceptor` Cloud Function triggers. Instead of fetching the UI from the external internet, it uses `fs.readFileSync(__dirname + '/app.html')` to read the HTML directly from disk (0ms HTTP overhead).
5. **The Regex Injection:**
   The Function Regex replaces Open Graph tags dynamically mapped to the request URL and serves the response.

## 3. Implementation Steps

### A. Construct the Cloud Function Engine
Create the core TypeScript logic utilizing explicit domain mapping. (Hardcoded canonical domains prevent `cloudfunctions.net` URL masking from breaking social shares).

```typescript
import { onRequest } from "firebase-functions/v2/https";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://cv-digital-9e0c4.web.app";

const routes: Record<string, any> = {
  "/": { title: "Home | Site", description: "Default desc", image: `${BASE_URL}/assets/cv-digital-logo.png`, url: BASE_URL },
  // Map other routes identically...
};

export const seoInterceptor = onRequest((req: any, res: any) => {
  const indexPath = path.resolve(__dirname, "./app.html");
  let html = fs.readFileSync(indexPath, "utf8");

  const cleanPath = req.url.split("?")[0];
  const meta = routes[cleanPath] || routes["/"];

  // Inject Tags using global case-insensitive matching
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${meta.title}</title>`);
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${meta.title}" />`);
  // [repeat for description, og:url, og:image, twitter:* variants]

  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  res.status(200).send(html);
});
```

### B. Configure Firebase Rewrites (`firebase.json`)
Remove `index.html` from Hosting deployment and enforce the Cloud Function logic.

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "index.html"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "seoInterceptor"
      }
    ]
  }
}
```

### C. Link Post-Build Triggers (`package.json`)
Connect the client build matrix to the Cloud Function dependencies. The `postbuild` script automatically acts upon `npm run build`.

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "postbuild": "npm --prefix functions install && npm run build --prefix functions && cp dist/index.html functions/lib/app.html"
  }
}
```

## 4. Key Takeaways for AI Code Assistants
- **NEVER use `req.hostname` randomly on Firebase:** `cloudfunctions.net` causes canonical masking errors globally for social bots. Expose and use `BASE_URL`.
- **fs.readFileSync Context:** Do not fetch from the main domain via HTTP within the function. Bundling the UI `index.html` as `app.html` internally guarantees stability and reduces Time To First Byte (TTFB).
- **TypeScript Only:** Even if copying JS templates from older guides, all Function implementation should leverage structured `tsc` compliance mapped to `.ts` syntax globally.
