import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "../components/ui/Button";
import { RSVPModal } from "../components/ui/RSVPModal";
import { tours } from "../lib/tours";
import { TourItem } from "../components/TourItem";
import { Helmet } from "react-helmet-async";

export function Tour() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-gold selection:text-brand-dark">
      <Helmet>
        <title>The Live Movement | Raploard</title>
        <meta
          name="description"
          content="Experience the energy live. Raploard's official world tour dates, ticket info, and RSVP for priority access to future shows."
        />
        <meta property="og:title" content="The Live Movement | Raploard" />
        <meta
          property="og:description"
          content="Experience the energy live. Raploard's official world tour dates, ticket info, and RSVP for priority access to future shows."
        />
        <meta property="og:image" content="/raploard-hero.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <section className="h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
        >
          <source src="/carry-go.mp4" type="video/mp4" />
        </video>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-header text-brand-gold tracking-[0.5em] text-sm uppercase mb-6 block">
              The Movement Continues
            </span>
            <h1 className="font-header text-7xl md:text-[10rem] lg:text-[12rem] font-bold uppercase tracking-tighter leading-[0.8] mb-8">
              World <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-gold to-white bg-[length:200%_auto] animate-gradient-x">
                Circuit.
              </span>
            </h1>
            <p className="font-body text-gray-400 text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-widest font-light">
              Experience the energy live. <br />
              Limited tickets per city.
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
              Scroll to explore
            </span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-brand-gold to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* The Circuit List or Golden Circle Empty State */}
      <section className="py-32 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
          <svg
            width="1200"
            height="600"
            viewBox="0 0 1200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M150 300Q300 100 600 300T1050 300"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="10 10"
            />
            <circle cx="150" cy="300" r="4" fill="gold" />
            <circle cx="600" cy="300" r="4" fill="gold" />
            <circle cx="1050" cy="300" r="4" fill="gold" />
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          {tours.length > 0 ? (
            <div className="space-y-40">
              {tours.map((show, index) => {
                const isEven = index % 2 === 0;
                return <TourItem key={show.id} show={show} isEven={isEven} />;
              })}
            </div>
          ) : (
            <div className="py-16">
              <div className="container mx-auto px-6 text-center max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 p-12 md:p-20 rounded-sm backdrop-blur-md relative"
                >
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-gold" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-gold" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-gold" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-gold" />

                  <Star className="text-brand-gold w-12 h-12 mx-auto mb-8 animate-pulse" />
                  <h2 className="font-header text-4xl md:text-6xl font-bold uppercase mb-6">
                    The Circuit is Dark.
                  </h2>
                  <p className="font-body text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed italic">
                    "The next wave is in the making. Join the Golden Circle to
                    get priority access to future tour announcements and private
                    shows."
                  </p>
                  <Button
                    size="lg"
                    variant="primary"
                    className="min-w-[280px] h-16 text-lg uppercase tracking-widest"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Enter The Circle
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <RSVPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
