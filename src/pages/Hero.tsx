import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VideoModal } from "../components/ui/VideoModal";

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-dark">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0">
        <img
          src="/raploard-hero.jpeg"
          alt="Raploard Hero"
          className="h-full w-full object-cover object-[50%_20%] opacity-80"
        />
        {/* Bottom fade for smooth transition to next section */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
        {/* Strong Left Gradient to make text readable and face bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 via-40% to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 container mx-auto">
        <div className="max-w-2xl space-y-8 mt-20 md:mt-0">
          {" "}
          {/* Constrained width */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-header text-[clamp(4rem,12vw,10rem)] font-bold uppercase leading-[0.9] text-white tracking-tighter">
              Rap
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-600">
                Loard
              </span>
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-4 text-xl md:text-2xl font-body font-light tracking-wide text-gray-300"
          >
            <div className="h-[1px] w-12 bg-brand-gold" />
            <span>AFROBEATS SUPERSTAR</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 pt-8"
          >
            <Button size="lg" withArrow>
              Stream Latest Hit
            </Button>

            <button
              onClick={() => setIsVideoOpen(true)}
              className="group flex items-center gap-4 text-white hover:text-brand-gold transition-colors duration-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-brand-gold group-hover:border-brand-gold border-brand-gold">
                <Play className="h-6 w-6 ml-1 fill-current" />
              </div>
              <span className="text-lg font-bold uppercase tracking-widest">
                Watch Video
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Social Proof / Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 right-10 hidden md:block"
      >
        <div className="flex flex-col items-end gap-2 text-right">
          <span className="text-5xl font-header font-bold text-brand-gold">
            #1
          </span>
          <span className="text-sm uppercase tracking-widest text-gray-400">
            Trending in Lagos
          </span>
        </div>
      </motion.div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId="dQw4w9WgXcQ" // Placeholder ID, user can change later
      />
    </div>
  );
}
