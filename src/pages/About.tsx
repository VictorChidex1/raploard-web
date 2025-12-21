import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { Award, User } from "lucide-react";

export function About() {
  return (
    <div className="min-h-screen bg-brand-dark pt-20">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/3 relative"
          >
            <div className="aspect-[3/4] rounded-sm overflow-hidden border border-white/10">
              <img
                src="/raploard-hero.jpeg"
                alt="Raploard"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute -z-10 top-6 -left-6 w-full h-full border border-brand-gold/30" />
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-2/3 space-y-8"
          >
            <div>
              <h1 className="font-header text-6xl text-white uppercase mb-4">
                The <span className="text-brand-gold">Story</span>
              </h1>
              <p className="text-xl text-gray-300 font-light leading-relaxed max-w-2xl">
                From the vibrant streets of Lagos to global stages, Raploard has
                redefined the sound of modern Afrobeats. His journey is one of
                resilience, rhythm, and raw talent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div className="space-y-4">
                <h3 className="font-header text-2xl text-white uppercase flex items-center gap-2">
                  <Award className="text-brand-gold" />
                  Achievements
                </h3>
                <ul className="text-gray-400 space-y-2 list-disc list-inside">
                  <li>#1 Trending on Apple Music Nigeria</li>
                  <li>Winner, Best New Act (Headies)</li>
                  <li>Over 10M+ Streams Global</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-header text-2xl text-white uppercase flex items-center gap-2">
                  <User className="text-brand-gold" />
                  Background
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Born David Okonkwo, Raploard discovered his passion for music
                  in church choirs before hitting the studio. His unique blend
                  of traditional highlife and contemporary trap beats sets him
                  apart.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
