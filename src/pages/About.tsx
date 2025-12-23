import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";

export function About() {
  return (
    <div className="min-h-screen bg-brand-dark pt-20 text-white">
      <Navbar />

      <div className="container mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-16 items-start"
        >
          {/* Image Side - Sticky on Desktop */}
          <div className="w-full md:w-5/12 sticky top-32">
            <div className="aspect-[3/4] rounded-sm overflow-hidden border border-white/10 relative group">
              <img
                src="/raploard-hero.jpeg"
                alt="Raploard"
                className="w-full h-full object-cover filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <h2 className="font-header text-4xl uppercase">Raploard</h2>
                <p className="text-brand-gold tracking-widest text-sm font-bold">
                  THE NEW WAVE
                </p>
              </div>
            </div>
          </div>

          {/* Text Side - Scrollable */}
          <div className="w-full md:w-7/12 space-y-8">
            <div>
              <h1 className="font-header text-5xl md:text-7xl uppercase mb-6 leading-none">
                Born to <span className="text-brand-gold">Dominate</span>
              </h1>
              <div className="w-24 h-1 bg-brand-gold mb-8" />
            </div>

            <div className="space-y-6 text-lg text-gray-300 font-light leading-relaxed">
              <p>
                Born{" "}
                <strong className="text-white">
                  Emmanuel Oluwafemi Olafisoye
                </strong>{" "}
                but widely recognized by his stage name,
                <span className="text-white"> Raploard</span>, he is a
                fast-rising star in the Afrobeat music scene and is tagged to
                change the face of the AFRICAN music Industry.
              </p>

              <p>
                Hailing from{" "}
                <span className="text-white">Ogun State, Nigeria</span>,
                Raploard grew up in Lagos, surrounded by the rich cultural
                rhythms of West African music. His journey into music began at a
                young age, inspired by the legendary Afrobeat sound pioneered by
                icons like{" "}
                <strong className="text-brand-gold">
                  D'banj, 2Baba, and Wizkid
                </strong>
                .
              </p>

              <p>
                He developed a deep appreciation for the genre's fusion of
                traditional African beats with modern sounds like hip-hop, pop,
                and dancehall. His parents were avid music lovers and often
                played a diverse range of music in their home, influencing his
                eclectic style.
              </p>

              <div className="border-l-4 border-brand-gold pl-6 py-2 my-8 bg-white/5 rounded-r-md">
                <h3 className="text-white font-bold text-xl mb-2">
                  The Breakthrough 🚀
                </h3>
                <p className="italic text-gray-400">
                  "His breakthrough came when he dropped{" "}
                  <strong className="text-white">'Grass to Grace'</strong>{" "}
                  featuring Barry Jhay, which was widely accepted and quickly
                  went viral, catching the attention of producers and music
                  lovers across Nigeria and beyond."
                </p>
              </div>

              <p>
                His early experiences involved singing in his local church
                choir, where he honed his vocal abilities and discovered his
                passion for storytelling through music. After high school,
                Raploard pursued his musical ambitions by collaborating with
                local producers and performing at community events.
              </p>

              <p>
                Raploard's lyrics often explore themes of love, resilience,
                social issues, and the complexities of modern African life. His
                unique voice and sound blend traditional Afrobeat rhythms with
                contemporary beats, creating a refreshing take on the genre.
                Known for his lyrical prowess and dynamic energy, he has
                established himself as a promising voice in the scene.
              </p>
            </div>

            <div className="pt-8 flex gap-4">
              <div className="flex flex-col">
                <span className="text-brand-gold font-bold text-3xl">1M+</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  Streams
                </span>
              </div>
              <div className="w-px bg-white/20 h-10 mx-4" />
              <div className="flex flex-col">
                <span className="text-brand-gold font-bold text-3xl">20+</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  Singles
                </span>
              </div>
              <div className="w-px bg-white/20 h-10 mx-4" />
              <div className="flex flex-col">
                <span className="text-brand-gold font-bold text-3xl">
                  Global
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  Reach
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
