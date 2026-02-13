import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VideoModal } from "../components/ui/VideoModal";

interface Album {
  title: string;
  type: string;
  releaseDate: string;
  image: string;
  streamLink: string;
  videoId?: string; // Optional: If present, Play button opens modal
}

const albums: Album[] = [
  {
    title: "Carry Go",
    type: "Single",
    releaseDate: "Dec 15, 2025",
    image: "/carry-go.jpg",
    streamLink: "https://ffm.to/carrygo",
  },
  {
    title: "Ella",
    type: "Single",
    releaseDate: "Nov 14, 2025",
    image: "/raploard-ella.jpeg",
    streamLink: "https://ffm.to/ellla",
  },
  {
    title: "Which One",
    type: "Single",
    releaseDate: "Dec 31, 2024",
    image: "/which-one.webp",
    streamLink: "https://fanlink.tv/which-one",
  },
  {
    title: "Deep Down",
    type: "Single",
    releaseDate: "Jun 25, 2024",
    image: "https://img.youtube.com/vi/lpSNfx7jYJc/maxresdefault.jpg", // YouTube Thumbnail
    streamLink: "https://ffm.to/deep_down",
    videoId: "lpSNfx7jYJc", // Trigger for modal
  },
  {
    title: "Next Best Thing EP",
    type: "EP",
    releaseDate: "Mar 28, 2024",
    image: "/next-best-thing.jpeg",
    streamLink: "https://ffm.to/nextbestthing",
  },
  {
    title: "Won Beh",
    type: "Single",
    releaseDate: "Oct 11, 2023",
    image: "/won-beh.jpeg",
    streamLink: "https://ffm.to/wonbeh",
  },
  {
    title: "The Goat EP",
    type: "Single",
    releaseDate: "Sept 29, 2023",
    image: "/the-goat-ep.jpeg",
    streamLink: "https://ffm.to/thegoatep",
  },
  {
    title: "Die Hard",
    type: "Single",
    releaseDate: "Feb 19, 2023",
    image: "/die-hard.jpeg",
    streamLink: "https://ffm.to/diehard",
  },
  {
    title: "One More",
    type: "Single",
    releaseDate: "July 25, 2022",
    image: "/one-more.jpeg",
    streamLink: "https://ffm.to/raploard-one-more",
  },
  {
    title: "Save Me A Dance",
    type: "Single",
    releaseDate: "Nov 23, 2023",
    image: "/save-me-a-dance.jpeg",
    streamLink: "https://ffm.to/raploard-save-me-a-dance",
  },
  {
    title: "100 Percent (feat. Otega)",
    type: "Single",
    releaseDate: "Nov 23, 2023",
    image: "/100-percent.jpg",
    streamLink: "https://fanlink.tv/100-percent-ft-otega",
  },
  {
    title: "Evolution EP",
    type: "Single",
    releaseDate: "April 8, 2023",
    image: "/evolution-ep.jpeg",
    streamLink: "https://ffm.to/raploard-evolution-ep",
  },
  {
    title: "Unstoppable",
    type: "Single",
    releaseDate: "April 8, 2023",
    image: "/unstoppable.jpeg",
    streamLink: "https://fanlink.tv/raploard-unstoppable",
  },
  {
    title: "Grass to Grace (feat. Barry Jhay)",
    type: "Single",
    releaseDate: "Aug 12, 2020",
    image: "/grass-to-grace.jpeg",
    streamLink: "https://ffm.to/raploard-grass-to-grace",
  },
];

export function Music() {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

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
                    className="rounded-full w-14 h-14 bg-brand-gold text-brand-dark border-none hover:scale-110 transition-transform"
                    onClick={() => {
                      if (album.videoId) {
                        setPlayingVideoId(album.videoId);
                      } else {
                        window.open(album.streamLink, "_blank");
                      }
                    }}
                  >
                    <Play className="ml-1 fill-current" />
                  </Button>
                </div>
              </div>

              <h3 className="text-2xl font-header font-bold text-white uppercase">
                {album.title}
              </h3>
              <div className="flex items-center gap-3 text-gray-400 text-sm uppercase tracking-widest mt-2">
                <span>{album.releaseDate}</span>
                <span className="w-1 h-1 bg-brand-gold rounded-full" />
                <span>{album.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />

      {/* Video Modal Integration */}
      <VideoModal
        isOpen={!!playingVideoId}
        onClose={() => setPlayingVideoId(null)}
        videoId={playingVideoId || ""}
      />
    </div>
  );
}
