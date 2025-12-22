import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { RSVPModal } from "../components/ui/RSVPModal";

export function Store() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-dark pt-20">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="font-header text-6xl text-white uppercase mb-2">
            Official Store
          </h1>
          <div className="h-1 w-20 bg-brand-gold" />
        </motion.div>

        {/* Coming Soon Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-12 md:p-24 text-center">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[100px] -z-10" />

          <ShoppingBag className="w-16 h-16 text-brand-gold mx-auto mb-8" />

          <h2 className="font-header text-4xl md:text-6xl text-white uppercase mb-6">
            New Collection <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white">
              Dropping Soon
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            We are crafting premium streetwear and exclusive merchandise for the
            Vibe Kingdom. Be the first to secure your piece before the public
            launch.
          </p>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="mx-auto"
          >
            Join the Waitlist
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Teasers (Optional - just boxes for now) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 opacity-50 pointer-events-none grayscale">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square bg-white/5 border border-white/5 rounded-xl flex items-center justify-center"
            >
              <span className="text-white/20 font-header text-2xl uppercase">
                Mystery Item 0{i}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-4 uppercase tracking-widest">
          Sneak Peeks
        </p>
      </div>

      <Footer />

      {/* Reusing the RSVP Modal for Store Waitlist too! */}
      <RSVPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
