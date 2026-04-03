import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // We check for slug (from /news/:slug) or path (from other rewrites)
  const { slug, path } = req.query;

  // 1. Fetch the raw generic HTML of our React app hosted on Vercel
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string);
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let rawHtml = '';
  try {
    const response = await fetch(`${baseUrl}/index.html`);
    rawHtml = await response.text();
  } catch (err) {
    console.error("Failed to fetch base HTML:", err);
    return res.status(500).send("Error fetching base HTML");
  }

  // 2. Define the Luxury Metadata Matrix for Static Pages
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

  interface ArticleMeta {
    title: string;
    excerpt: string;
    coverImage: string;
  }

  let article: ArticleMeta | null = null;

  // 3. Identification Logic
  if (slug && !Array.isArray(slug)) {
    // Dynamic Case: Fetch from Firestore
    const projectId = 'raploard-official';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    
    try {
      const queryResponse = await fetch(firestoreUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'journal' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'slug' },
                op: 'EQUAL',
                value: { stringValue: slug }
              }
            },
            limit: 1
          }
        })
      });

      const data = await queryResponse.json();
      if (data && data.length > 0 && data[0].document) {
        const doc = data[0].document.fields;
        article = {
          title: doc.title?.stringValue + " | Raploard Journal",
          excerpt: doc.excerpt?.stringValue || "Read the latest update from Raploard",
          coverImage: doc.coverImage?.stringValue || `${baseUrl}/raploard.jpeg`,
        };
      }
    } catch (err) {
      console.error("Firebase REST Query Failed:", err);
    }
  } else if (path && !Array.isArray(path) && metaMatrix[path]) {
    // Static Case: Use Matrix
    const staticMeta = metaMatrix[path];
    article = {
      title: staticMeta.title,
      excerpt: staticMeta.excerpt,
      coverImage: staticMeta.image
    };
  }

  // 4. Fallback if no specific meta found
  if (!article) {
    return res.status(200).send(rawHtml);
  }

  // 5. Forcefully inject the dynamic SEO metadata into the HTML <head> string
  const safeTitle = article.title.replace(/"/g, '&quot;');
  const safeExcerpt = article.excerpt.replace(/"/g, '&quot;');
  const safeImage = article.coverImage.replace(/"/g, '&quot;');

  const modifiedHtml = rawHtml
    .replace(
      /<title>.*<\/title>/i, 
      `<title>${safeTitle}</title>`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/i, 
      `<meta property="og:title" content="${safeTitle}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/i, 
      `<meta property="og:description" content="${safeExcerpt}"`
    )
    .replace(
      /<meta name="description" content="[^"]*"/i, 
      `<meta name="description" content="${safeExcerpt}"`
    )
    .replace(
      /<meta property="og:image" content="[^"]*"/i, 
      `<meta property="og:image" content="${safeImage}"`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"/i, 
      `<meta name="twitter:image" content="${safeImage}"`
    );

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(modifiedHtml);
}
