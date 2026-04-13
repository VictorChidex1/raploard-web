Comprehensive Guide: Vercel Serverless Function SEO Interceptor for CSR SPAs
Target Audience: Lead Architects, AI Coding Assistants, Senior Full-Stack Engineers.

1. The Core Problem
   In standard Client-Side Rendered (CSR) Single Page Applications (like those built with React + Vite), the server inherently returns a generic, static index.html file regardless of the route requested (e.g., /works or /contact). React then loads and dynamically mounts the appropriate page logic on the client.

The consequence format: Web Crawlers (Google, Twitter/X, LinkedIn) often do not execute JavaScript. Therefore, they scrape only the generic index.html tags. If you share yoursite.com/works, the crawler still sees the <title> and og:image meant for the Home page.

2. The Solution Concept
   Instead of migrating the entire application to Next.js or a complex Server-Side Rendering (SSR) framework, we use Vercel Serverless Functions as an Edge/Server-side Interceptor.

When a URL request hits Vercel, instead of immediately serving the generic index.html, we route the request to a Node.js Serverless Function. This function determines the requested route, fetches the generic index.html, dynamically injects specific SEO tags for that route, and serves the finalized HTML text directly to the requester.

3. Implementation Steps
   Step 1: Routing Configuration (vercel.json)
   The first step overrides the default SPA routing mechanics to route traffic mathematically to the serverless function.

{
"rewrites": [
{
"source": "/assets/(.*)",
"destination": "/assets/$1"
},
{
"source": "/(.*)\\.(.*)",
"destination": "/$1.$2"
},
{
"source": "/index.html",
"destination": "/index.html"
},
{
"source": "/(.*)",
"destination": "/api/seo"
}
]
}

Why this matters:

Rule 1 & 2: Ensures all static assets (.js, .css, .webp, .png) are served immediately from the CDN, bypassing the function to eliminate latency.
Rule 3: Prevents recursion when our Serverless function explicitly requests the raw index.html using a direct fetch.
Rule 4: Acts as the "Catch-all". Any clean URL (/blog, /works, etc.) gets funneled into the new /api/seo Serverless function instance.
Step 2: The Logic Engine (api/seo.js)
This is the Node.js function situated in the /api directory. It requires no dependencies, operating entirely on fundamental Regex and the native fetch module.

Phase A: Payload Definition
Establish a map pointing paths to specific payloads.

const defaults = {
title: "Global Default Title",
description: "Default description",
image: "https://url.com/og-image.webp"
};

const routes = {
"/": defaults,
"/works": {
title: "Selected Works | Portfolio",
description: "My specialized implementation portfolio.",
image: defaults.image
}
};

Phase B: The Raw HTML Fetch
To modify the HTML, the function must first obtain the raw HTML from the CDN infrastructure.

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    // Grabs the static file directly, hitting the `vercel.json` Rule 3
    const response = await fetch(`${protocol}://${host}/index.html`);
    let html = await response.text();

Phase C: Server-Side String Replacement
Leverage Regex matching with /gi (global/case-insensitive) flags to find the generic tags and inject the custom variables.

    const cleanPath = req.url.split('?')[0];
    const meta = routes[cleanPath] || defaults;

    // Inject Title and standard Meta Attributes
    html = html.replace(/<title>.*?<\/title>/gi, `<title>${meta.title}</title>`);
    html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="description" content="${meta.description}" />`);

    // Overwrite deeply integrated Open Graph standard tags
    html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${meta.title}" />`);
    // ... Repeat for og:description, og:image, and twitter:* iterations

Phase D: Formulate the Response
Respond with the dynamically configured DOM payload to the requester.

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Important: Edge caching mechanism
    return res.status(200).send(html);

Summary for AI Assistants
When asked to implement this architecture:

Always isolate static assets out of the rewrites flow block first.
Establish api/seo.js. Do not use local module imports like fs.readFileSync for reading the index.html unless you've heavily manipulated Vercel's outputFileTracing. Standardizing purely against fetch(req.headers.host + '/index.html') guarantees 100% stable CDN retrieval during Edge-invocation.
Validate Regex to account for variable tag structure variations (self closing vs not self closing /> vs >). Ensure it handles both double " and single ' quotation marks.
