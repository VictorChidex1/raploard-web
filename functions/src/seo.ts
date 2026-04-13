import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

/**
 * SEO Interceptor Cloud Function
 * 
 * Purpose: This function intercepts requests from social media bots and 
 *          browsers to inject page-specific metadata (Dynamic SEO). 
 *          1. It fetches the static index.html from Firebase Hosting.
 *          2. It identifies the page (Home, Music, News, etc.).
 *          3. It performs a real-time Firestore lookup for dynamic articles.
 *          4. It serves a "pre-baked" HTML shell with high-end SEO tags.
 */
export const seoInterceptor = onRequest({
  memory: "256MiB",
  maxInstances: 10,
  cpu: "featherweight" as any, // Firebase optimization for low-latency tasks
}, async (req, res) => {
  // 1. Detect if the visitor is a bot or a human
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /bot|crawl|slurp|spider|facebookexternalhit|WhatsApp|Twitterbot|linkedinbot/i.test(userAgent);

  // 2. Fetch the raw index.html from the hosting URL
  const baseUrl = `https://${req.hostname}`;
  let rawHtml = "";
  try {
      const response = await fetch(`${baseUrl}/index.html`);
      rawHtml = await response.text();
  } catch (err) {
      console.error("Failed to fetch base HTML from Hosting:", err);
      // Serve a simple fallback to prevent a total crash
      res.status(200).send("Loading Raploard...");
      return;
  }

  // 3. If it's a HUMAN USER, serve the raw HTML immediately with no server cache.
  // The client-side React app (with react-helmet-async) will handle SEO tags.
  if (!isBot) {
      res.set("Content-Type", "text/html");
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(200).send(rawHtml);
      return;
  }
  
  // --- BOT-ONLY LOGIC STARTS HERE ---
  // If the visitor is a bot, proceed with the original server-side SEO injection.
  
  const path = req.path || "/";
  const slug = path.startsWith("/news/") ? path.replace("/news/", "") : null;

  // Define the Luxury Metadata Matrix (Consistent with Vercel Engine)
  const metaMatrix: Record<string, { title: string; excerpt: string; image: string }> = {
    "/": {
      title: "Raploard | The New Wave of Afrobeats",
      excerpt: "Official website of Raploard - The Afrobeats Superstar. Stream the latest hits, watch exclusive videos, and check upcoming tour dates.",
      image: `${baseUrl}/raploard.jpeg`
    },
    "/music": {
      title: "The Discography | Raploard",
      excerpt: "Explore the sonic evolution of Raploard. Stream the latest Afrobeats singles, EPs, and global hits.",
      image: `${baseUrl}/raploard-son.jpg`
    },
    "/videos": {
      title: "The Visual Vault | Raploard",
      excerpt: "Experience the cinematic journey of Raploard. Official music videos, live performances, and exclusive visual content.",
      image: "https://img.youtube.com/vi/lpSNfx7jYJc/maxresdefault.jpg"
    },
    "/tour": {
      title: "The Live Circuit | Raploard",
      excerpt: "Experience the energy live. Raploard's official world tour dates, ticket info, and RSVP for priority access to future shows.",
      image: `${baseUrl}/raploard-hero.jpeg`
    },
    "/about": {
      title: "The Sonic Manifesto | Raploard",
      excerpt: "Discover the story of Raploard. The rising star of Afrobeats, charting a new path from Ogun State to the global stage.",
      image: `${baseUrl}/raploard-hero.jpeg`
    },
    "/contact": {
      title: "Secure Inquiries | Raploard",
      excerpt: "Direct channel for booking Raploard, press inquiries, and brand collaborations. Connect with the new wave of Afrobeats.",
      image: `${baseUrl}/raploard-hero.jpeg`
    },
    "/store": {
      title: "The Official Store | Raploard",
      excerpt: "Exclusive Raploard merchandise, apparel, and limited edition items. Own the movement and join the elite waitlist.",
      image: `${baseUrl}/raploard-hero.jpeg`
    },
    "/news": {
      title: "The Vault | Raploard Journal",
      excerpt: "Official news, press releases, and behind-the-scenes stories from the Raploard camp. The archives are open.",
      image: `${baseUrl}/raploard-hero.jpeg`
    },
    "/privacy": {
      title: "The Vault | Privacy Protocol",
      excerpt: "Official privacy and data protection protocols for the Raploard digital ecosystem. Transparency and security.",
      image: `${baseUrl}/raploard-hero.jpeg`
    },
    "/terms": {
      title: "The Accord | Terms of Service",
      excerpt: "The governing terms and conditions for interacting with the Raploard platform and its digital assets.",
      image: `${baseUrl}/raploard-hero.jpeg`
    }
  };

  interface SEOData {
    title: string;
    excerpt: string;
    image: string;
  }

  let seo: SEOData | null = null;

  // Dynamic Identification Logic
  if (slug) {
      try {
          const db = admin.firestore();
          const snapshot = await db.collection("journal")
              .where("slug", "==", slug)
              .limit(1)
              .get();

          if (!snapshot.empty) {
              const doc = snapshot.docs[0].data();
              seo = {
                  title: `${doc.title} | Raploard Journal`,
                  excerpt: doc.excerpt || "Read the latest update from Raploard",
                  image: doc.coverImage || `${baseUrl}/raploard.jpeg`
              };
          }
      } catch (err) {
          console.error("Firestore SEO Lookup Failed:", err);
      }
  } else if (metaMatrix[path]) {
      const staticMeta = metaMatrix[path];
      seo = {
          title: staticMeta.title,
          excerpt: staticMeta.excerpt,
          image: staticMeta.image
      };
  }

  // Default Fallback
  if (!seo) {
      seo = {
          title: metaMatrix["/"].title,
          excerpt: metaMatrix["/"].excerpt,
          image: metaMatrix["/"].image
      };
  }

  // Injection Engine
  const safeTitle = seo.title.replace(/"/g, '&quot;');
  const safeExcerpt = seo.excerpt.replace(/"/g, '&quot;');
  const safeImage = seo.image.replace(/"/g, '&quot;');

  const modifiedHtml = rawHtml
    .replace(/<title>.*<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta property="og:title" content="[^"]*"/i, `<meta property="og:title" content="${safeTitle}"`)
    .replace(/<meta property="og:description" content="[^"]*"/i, `<meta property="og:description" content="${safeExcerpt}"`)
    .replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${safeExcerpt}"`)
    .replace(/<meta property="og:image" content="[^"]*"/i, `<meta property="og:image" content="${safeImage}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/i, `<meta name="twitter:image" content="${safeImage}"`);
  
  // Serve the "Pre-baked" Response with a short cache for bots
  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "public, max-age=300, s-maxage=600"); // 5min browser, 10min CDN
  res.status(200).send(modifiedHtml);
});
