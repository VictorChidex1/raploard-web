import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, where, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage: string;
  featured?: boolean;
}

export function News() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  const PAGE_SIZE = 10;
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (pageIndex: number) => {
    if (pageIndex > 1) setLoadingPage(true);
    else setLoading(true);
    
    try {
      let q = query(
        collection(db, "journal"),
        where("publishDate", "<=", Timestamp.now()),
        orderBy("publishDate", "desc"),
        limit(PAGE_SIZE)
      );

      if (pageIndex > 1 && pageCursors[pageIndex - 2]) {
        q = query(
          collection(db, "journal"),
          where("publishDate", "<=", Timestamp.now()),
          orderBy("publishDate", "desc"),
          startAfter(pageCursors[pageIndex - 2]),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        let dateStr = "";
        if (data.publishDate?.toDate) {
             dateStr = data.publishDate.toDate().toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
             });
        }
        return { id: doc.id, ...data, date: dateStr } as ArticleData;
      });

      if (docs.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);

      if (snapshot.docs.length > 0) {
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setPageCursors(prev => {
           const newCursors = [...prev];
           newCursors[pageIndex - 1] = lastDoc; // Stores the cursor to be used for the NEXT page
           return newCursors;
        });
      }

      setArticles(docs);
      setCurrentPage(pageIndex);
      
      // Auto scroll slightly back up to the top of the feed when clicking Next/Prev
      if (pageIndex > 1) {
         window.scrollTo({ top: window.innerHeight * 0.7, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, []);

  // Use the first article as featured if none explicitly marked
  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const supportingArticles = articles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-[#070708] text-white overflow-hidden relative selection:bg-brand-gold selection:text-black">
      <Navbar />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-end justify-between border-b border-white/10 pb-8"
        >
          <h1 className="font-header text-5xl md:text-8xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-brand-gold/50">
            Journal
          </h1>
          <p className="text-white/40 font-mono text-xs hidden md:block">
            VOL 01. / THE VAULT ARCHIVES
          </p>
        </motion.div>
      </div>

      <main className="px-6 md:px-12 max-w-screen-2xl mx-auto pb-32 min-h-[50vh]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
            <p className="text-white/40 font-header uppercase tracking-widest text-sm">No articles published yet.</p>
          </div>
        ) : (
          <>
            {/* ─── The Hero Feature (Asymmetric) ─── */}
            {featuredArticle && (
              <Link to={`/news/${featuredArticle.slug || featuredArticle.id}`} className="block relative group mb-32 cursor-pointer">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 overflow-hidden rounded-sm relative aspect-[4/5] lg:aspect-[4/3] bg-[#070708] group">
                    <motion.div style={{ y: heroY }} className="absolute inset-x-0 -inset-y-20">
                      {/* Blurry Backdrop */}
                      <div 
                        className="w-full h-full bg-cover bg-center opacity-20 blur-2xl scale-125"
                        style={{ backgroundImage: `url("${featuredArticle.coverImage}")` }}
                      />
                      {/* Main Contained Image */}
                      <img
                        src={featuredArticle.coverImage}
                        alt={featuredArticle.title}
                        className="absolute inset-0 w-full h-full object-contain grayscale-[80%] contrast-125 mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700 ease-out z-10"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-20" />
                  </div>

                  <div className="lg:col-span-4 lg:-ml-16 z-10 bg-[#070708]/90 backdrop-blur-md p-8 border border-white/[0.05] shadow-2xl relative">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="font-header text-brand-gold text-[10px] tracking-[0.3em] uppercase">{featuredArticle.category}</span>
                        <span className="w-8 h-[1px] bg-brand-gold/30" />
                        <span className="font-mono text-white/30 text-[10px]">{featuredArticle.date}</span>
                      </div>
                      
                      <h2 className="font-serif text-4xl lg:text-5xl leading-[1.1] text-white tracking-tight mb-6 group-hover:text-brand-gold transition-colors duration-500">
                        {featuredArticle.title}
                      </h2>
                      
                      <p className="text-white/60 text-sm leading-relaxed mb-8">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:border-brand-gold group-hover:text-brand-gold transition-colors duration-500">
                        <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            )}

            {/* ─── The Lookbook Scroll (Zig-Zag list) ─── */}
            <div className="space-y-40">
              {supportingArticles.map((article, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <Link 
                    to={`/news/${article.slug || article.id}`}
                    key={article.id} 
                    className="block group cursor-pointer"
                  >
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}
                    >
                      <div className="w-full lg:w-1/2 overflow-hidden aspect-[4/5] rounded-sm relative">
                        <div 
                          className="w-full h-full bg-cover bg-center grayscale-[90%] contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 ease-out"
                          style={{ backgroundImage: `url("${article.coverImage}")` }}
                        />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none group-hover:opacity-10 transition-opacity" />
                      </div>

                      <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="font-header text-brand-gold text-[10px] tracking-[0.3em] uppercase">{article.category}</span>
                          <span className="font-mono text-white/30 text-[10px]">{article.date}</span>
                        </div>
                        
                        <h3 className="font-serif text-3xl lg:text-4xl leading-tight text-white mb-6 group-hover:text-brand-gold transition-colors duration-500">
                          {article.title}
                        </h3>
                        
                        <p className="text-white/50 text-sm leading-relaxed max-w-md">
                          {article.excerpt}
                        </p>

                        <div className="mt-8 flex items-center gap-3 text-xs font-header uppercase tracking-widest text-white/40 group-hover:text-brand-gold transition-colors">
                          Read Article
                          <div className="w-8 h-[1px] bg-white/20 group-hover:bg-brand-gold group-hover:w-12 transition-all duration-500" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {(currentPage > 1 || hasMore) && supportingArticles.length > 0 && (
              <div className="mt-32 pt-12 border-t border-white/10 flex items-center justify-between">
                <div>
                   <button
                     onClick={() => fetchArticles(currentPage - 1)}
                     disabled={currentPage === 1 || loadingPage}
                     className="px-8 py-4 border border-white/20 rounded-sm font-header text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white hover:border-brand-gold disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/60 transition-all duration-300 flex items-center gap-2"
                   >
                     {loadingPage && currentPage > 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : "← Prev"}
                   </button>
                </div>
                
                <div className="text-white/30 font-mono text-xs tracking-widest uppercase">
                   Page {currentPage}
                </div>

                <div>
                   <button
                     onClick={() => fetchArticles(currentPage + 1)}
                     disabled={!hasMore || loadingPage}
                     className="px-8 py-4 border border-white/20 rounded-sm font-header text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white hover:border-brand-gold disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/60 transition-all duration-300 flex items-center gap-2"
                   >
                     {loadingPage && !hasMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Next →"}
                   </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
