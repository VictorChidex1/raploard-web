import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { collection, query, where, getDocs, doc, getDoc, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ArticleData } from "./News";

export function Article() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        // Try searching by slug first
        const q = query(collection(db, "journal"), where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        
        let foundData = null;
        let foundId = "";

        if (!snapshot.empty) {
          foundData = snapshot.docs[0].data();
          foundId = snapshot.docs[0].id;
        } else {
          // Fallback: try fetching by ID directly if slug was actually the ID
          const docRef = doc(db, "journal", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            foundData = docSnap.data();
            foundId = docSnap.id;
          }
        }

        if (foundData) {
          let dateStr = "";
          if (foundData.publishDate?.toDate) {
             dateStr = foundData.publishDate.toDate().toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
             });
          }
          setArticle({
            id: foundId,
            ...foundData,
            date: dateStr,
          } as ArticleData);
        }
      } catch (err) {
        console.error("Failed to load article", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center text-white">
        <h1 className="font-header text-4xl mb-6">Article Not Found</h1>
        <Link to="/news" className="text-brand-gold uppercase tracking-widest text-sm hover:text-white transition-colors">
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-white selection:bg-brand-gold selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-32">
        {/* Back button */}
        <div className="max-w-screen-md mx-auto px-6 mb-12">
          <Link to="/news" className="inline-flex items-center gap-2 text-white/40 hover:text-brand-gold transition-colors font-header uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Archive
          </Link>
        </div>

        {/* Hero Meta */}
        <div className="max-w-screen-md mx-auto px-6 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-header text-brand-gold text-xs tracking-[0.3em] uppercase">{article.category}</span>
            <span className="w-8 h-[1px] bg-brand-gold/30" />
            <span className="font-mono text-white/40 text-xs">{article.date}</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight mb-8">
            {article.title}
          </h1>
          
          <p className="text-xl text-white/50 leading-relaxed font-light">
            {article.excerpt}
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-screen-xl mx-auto px-6 mb-20">
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-white/5 rounded-sm overflow-hidden relative">
            <div 
               className="w-full h-full bg-cover bg-center grayscale-[20%] contrast-125"
               style={{ backgroundImage: `url("${article.coverImage}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-screen-md mx-auto px-6">
          <div 
             className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-a:text-brand-gold font-light"
             style={{ whiteSpace: "pre-wrap" }}
          >
            {article.content}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
