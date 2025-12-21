import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "../components/ui/Button";

const albums = [
  {
    title: "Golden Touch",
    type: "EP",
    year: "2024",
    image: "/raploard2.jpeg",
    streamLink: "#",
  },
  {
    title: "Lagos Vibration",
    type: "Single",
    year: "2023",
    image: "/raploard.jpeg",
    streamLink: "#",
  },
];

export function Music() {
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
            Discography
          </h1>
          <div className="h-1 w-20 bg-brand-gold" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {albums.map((album, i) => (
            <motion.div
              key={album.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className="aspect-square bg-gray-900 rounded-sm overflow-hidden mb-6 relative">
                <img
                  src={album.image}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                  <Button
                    size="icon"
                    className="rounded-full w-14 h-14 bg-brand-gold text-brand-dark border-none"
                  >
                    <Play className="ml-1 fill-current" />
                  </Button>
                </div>
              </div>

              <h3 className="text-2xl font-header font-bold text-white uppercase">
                {album.title}
              </h3>
              <div className="flex items-center gap-3 text-gray-400 text-sm uppercase tracking-widest mt-2">
                <span>{album.year}</span>
                <span className="w-1 h-1 bg-brand-gold rounded-full" />
                <span>{album.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
