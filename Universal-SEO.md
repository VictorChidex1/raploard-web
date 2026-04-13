Universal SEO Interceptor Architecture
The Architecture (How it Works)
The system is a hybrid SEO engine designed to solve the "Social Media Crawling" problem typical of Single Page Applications (SPAs).

1. The Client-Side (React)
   We use react-helmet-async inside your React components (Home.tsx, Music.tsx, etc.).

Purpose: To update the browser tab title and metadata while a human is clicking through the site. This is great for Google but invisible to social media scrapers (WhatsApp/Twitter) because they don't execute JavaScript. 2. The Server-Side (The Interceptors)
To solve the "WhatsApp problem," we created two identical "smart" interceptors:

Vercel: api/og.ts (Serverless Function)
Firebase: functions/src/seo.ts (Cloud Function) 3. The Implementation Logic
Both functions follow this exact workflow when a link is shared:

Request Capture: When a bot hits any public URL (e.g., /news/raploard-shifts-the-paradigm), the hosting configuration (vercel.json or firebase.json) redirects the request to the Interceptor Function instead of the static file.
Base Fetch: The function fetches the raw index.html from your hosting.
Path Identification: It analyzes the URL to determine if the user is looking for a static brand page (like /music) or a dynamic article (/news/:slug).
Metadata Lookup:
Static Pages: It looks up values in a hardcoded "Luxury Metadata Matrix."
Dynamic Articles: It performs a real-time lookup in Firestore (journal collection) using the slug to find the specific title, excerpt, and cover image.
Tag Injection: It uses a string manipulation engine (.replace) to forcefully inject the unique <title>, og:title, og:description, and og:image tags into the HTML <head> string.
Response: It sends the "pre-baked" HTML back to the requester.
Key Benefits for Future AI Assistants
Performance: It bypasses the need for the browser to "boot up" before showing content to crawlers.
Consistency: The metadata served to WhatsApp is identical to the data stored in Firestore.
Resilience: If the lookup fails, it automatically falls back to the high-end Home Page branding.

NOTE

To the next assistant: Do not modify the routing in vercel.json or firebase.json without ensuring the seoInterceptor logic is updated to match. The Luxury Metadata Matrix in both api/og.ts and functions/src/seo.ts is the source of truth for all brand-level social media sharing.
