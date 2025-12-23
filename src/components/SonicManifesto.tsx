import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function SonicManifesto() {
  return (
    <section className="bg-brand-dark overflow-hidden py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* LEFT: The Portrait */}
          <motion.div
            className="w-full lg:w-1/2 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-white/5">
              {/* Image Placeholder - User should swap this for a high-fashion portrait */}
              <img
                src="/raploard.jpeg"
                alt="Raploard Portrait"
                className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
              />

              {/* Decorative border frame */}
              <div className="absolute inset-4 border border-white/20 pointer-events-none" />
            </div>

            {/* Background Accent */}
            <div className="absolute -z-10 top-12 -left-12 w-full h-full border border-brand-gold/20 rounded-sm" />
          </motion.div>

          {/* RIGHT: The Manifesto */}
          <div className="w-full lg:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-sm font-bold tracking-[0.3em] text-brand-gold uppercase mb-4">
                The Manifesto
              </h2>
              <h3 className="text-4xl md:text-6xl font-header font-bold text-white uppercase leading-none tracking-tight">
                The Sound of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  New Africa.
                </span>
              </h3>
            </motion.div>

            <motion.div
              className="space-y-6 text-lg text-gray-400 font-light leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p>
                Raploard isn't just a name; it's a frequency. Born from the heat
                of the streets and refined by global ambition, simple music
                becomes a movement when you refuse to compromise.
              </p>
              <p>
                From Lagos to London, the mission remains the same:
                <strong className="text-white font-medium ml-1">
                  Connect the culture. Amplify the vibe. dominate the noise.
                </strong>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/about">
                <Button variant="outline" className="group">
                  Read Full Bio
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
