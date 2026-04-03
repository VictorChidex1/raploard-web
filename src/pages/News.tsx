import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// ─── Types & Mock Data ──────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  coverImage: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Evolution of Raploard: A New Paradigm",
    category: "Cover Story",
    date: "12 Apr 2026",
    excerpt: "In an exclusive lookbox, the artist discusses the transition from raw street anthems to stadium-filling ballads, and what the future holds for the Afrobeats sound.",
    coverImage: "/raploard-hero.jpeg",
    featured: true,
  },
  {
    id: "2",
    title: "Global Circuit Tour: European Dates Added",
    category: "Tour",
    date: "05 Apr 2026",
    excerpt: "Management has formally confirmed an 8-country European leg for the highly anticipated Circuit Tour, kicking off in Paris.",
    coverImage: "/raploard.jpeg",
  },
  {
    id: "3",
    title: "Behind The Scenes: The Visuals",
    category: "Editorial",
    date: "28 Mar 2026",
    excerpt: "A raw, unedited glimpse into the making of the latest cinematic music video, directed by award-winning visionaries.",
    coverImage: "/WhatsApp Image 2025-12-21 at 13.30.20 (2).jpeg",
  },
  {
    id: "4",
    title: "Studio Sessions: The 100% Philosophy",
    category: "Music",
    date: "14 Mar 2026",
    excerpt: "We sit down with producers and engineers to uncover the meticulous sonic architecture behind the upcoming album.",
    coverImage: "/100-percent.jpg",
  }
];

// ─── Components ─────────────────────────────────────────────────────────────

export function News() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // Custom Cursor Tracker for Articles
  const [cursorText, setCursorText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 40); // center the 80px circle
      cursorY.set(e.clientY - 40);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  const featuredArticle = ARTICLES.find(a => a.featured) || ARTICLES[0];
  const supportingArticles = ARTICLES.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#070708] text-white overflow-hidden relative selection:bg-brand-gold selection:text-black">
      
      {/* ─── Custom Cursor ─── */}
      <motion.div
        className="fixed top-0 left-0 w-20 h-20 rounded-full flex items-center justify-center pointer-events-none z-[100] backdrop-blur-md border border-brand-gold/30 bg-black/40 text-brand-gold font-header text-[10px] tracking-widest uppercase shadow-[0_0_20px_rgba(255,215,0,0.1)]"
        style={{
          x: springX,
          y: springY,
          opacity: cursorVisible ? 1 : 0,
          scale: cursorVisible ? 1 : 0.5,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {cursorText}
      </motion.div>

      <Navbar />

      {/* ─── Page Title ─── */}
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

      {/* ─── The Hero Feature (Asymmetric) ─── */}
      <main className="px-6 md:px-12 max-w-screen-2xl mx-auto pb-32">
        <div 
          className="relative group cursor-none mb-32"
          onMouseEnter={() => {
            setCursorText("READ");
            setCursorVisible(true);
          }}
          onMouseLeave={() => setCursorVisible(false)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Image Block */}
            <div className="lg:col-span-8 overflow-hidden rounded-sm relative aspect-[16/9] lg:aspect-[4/3]">
              <motion.div 
                style={{ y: heroY }}
                className="absolute inset-x-0 -inset-y-10"
              >
                <div 
                  className="w-full h-full bg-cover bg-center grayscale-[80%] contrast-125 opacity-80 mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 ease-out"
                  style={{ backgroundImage: `url("${featuredArticle.coverImage}")` }}
                />
              </motion.div>
              {/* Noise overlay */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Typography Block */}
            <div className="lg:col-span-4 lg:-ml-16 z-10 bg-[#070708]/90 backdrop-blur-md p-8 border border-white/[0.05] shadow-2xl relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
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
        </div>

        {/* ─── The Lookbook Scroll (Zig-Zag list) ─── */}
        <div className="space-y-40">
          {supportingArticles.map((article, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center group cursor-none`}
                onMouseEnter={() => {
                  setCursorText("V I E W");
                  setCursorVisible(true);
                }}
                onMouseLeave={() => setCursorVisible(false)}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2 overflow-hidden aspect-[4/5] rounded-sm relative">
                  <div 
                     className="w-full h-full bg-cover bg-center grayscale-[90%] contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 ease-out"
                     style={{ backgroundImage: `url("${article.coverImage}")` }}
                  />
                  {/* Grain */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none group-hover:opacity-10 transition-opacity" />
                </div>

                {/* Text content offset */}
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
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
