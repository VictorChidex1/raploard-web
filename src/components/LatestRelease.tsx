import { motion } from "framer-motion";
import { Play, Music2, ExternalLink } from "lucide-react";
import { Button } from "./ui/Button";

export function LatestRelease() {
  return (
    <section className="py-24 bg-brand-dark/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center gap-12 md:gap-20"
        >
          {/* Cover Art */}
          <div className="w-full md:w-1/2 relative group">
            <div className="relative aspect-square overflow-hidden rounded-sm border border-white/10 shadow-2xl">
              <img
                src="/raploard2.jpeg"
                alt="Latest Album Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  size="icon"
                  className="rounded-full w-16 h-16 bg-brand-gold text-brand-dark hover:scale-110 border-none"
                >
                  <Play className="fill-current ml-1" size={32} />
                </Button>
              </div>
            </div>
            {/* Decorative border offset */}
            <div className="absolute -z-10 top-6 left-6 w-full h-full border border-brand-gold/30 rounded-sm" />
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 space-y-8 text-center md:text-left">
            <div className="space-y-2">
              <h2 className="text-brand-gold font-bold uppercase tracking-widest text-sm">
                New Release
              </h2>
              <h3 className="font-header text-5xl md:text-7xl font-bold text-white uppercase leading-none">
                Golden <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white">
                  Touch
                </span>
              </h3>
            </div>

            <p className="text-gray-400 text-lg max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
              The highly anticipated EP featuring the chart-topping single
              "Lagos Vibration". A fusion of pure Afrobeats energy and soulful
              rhythms.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Button size="lg" className="min-w-[180px]">
                <Music2 className="mr-2 h-5 w-5" />
                Stream Now
              </Button>
              <Button size="lg" variant="outline" className="min-w-[180px]">
                <ExternalLink className="mr-2 h-5 w-5" />
                Other Platforms
              </Button>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8 pt-8 opacity-60">
              {/* Pseudo-Logos text for now */}
              <span className="text-sm font-bold tracking-widest uppercase">
                Spotify
              </span>
              <span className="text-sm font-bold tracking-widest uppercase">
                Apple Music
              </span>
              <span className="text-sm font-bold tracking-widest uppercase">
                SoundCloud
              </span>
              <span className="text-sm font-bold tracking-widest uppercase">
                Audiomack
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
