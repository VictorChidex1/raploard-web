import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VideoModal } from "../components/ui/VideoModal";

interface Video {
  title: string;
  category: string;
  releaseDate: string;
  thumbnail: string;
  videoId: string;
}

const videos: Video[] = [
  {
    title: "Deep Down (Official Video)",
    category: "Music Video",
    releaseDate: "Jun 28, 2024",
    thumbnail: "https://img.youtube.com/vi/lpSNfx7jYJc/maxresdefault.jpg",
    videoId: "lpSNfx7jYJc",
  },
  {
    title: "Grass to Grace (feat. Barry Jhay)",
    category: "Music Video",
    releaseDate: "Mar 12, 2021",
    thumbnail: "https://img.youtube.com/vi/ZtPrykFW2B8/maxresdefault.jpg",
    videoId: "ZtPrykFW2B8",
  },
  {
    title: "Ella (Live Performance Video)",
    category: "Live Performance Video",
    releaseDate: "Nov 14, 2025",
    thumbnail: "https://img.youtube.com/vi/mr6xYQrywnU/maxresdefault.jpg",
    videoId: "mr6xYQrywnU",
  },
];

export function Videos() {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Filter out videos without IDs for now, or show them as coming soon?
  // Let's show them but maybe disable play or show "Coming Soon" if no ID.
  // For this implementation, I will just render the one working video and maybe placeholders that don't open modal if empty.

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
            Videos
          </h1>
          <div className="h-1 w-20 bg-brand-gold" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {videos.map((video, i) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative"
            >
              {/* Thumbnail Container */}
              <div className="aspect-video bg-gray-900 rounded-sm overflow-hidden mb-6 relative border border-white/10 shadow-lg">
                {video.videoId ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                    <span className="uppercase tracking-widest text-xs">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Play Overlay */}
                {video.videoId && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="icon"
                      className="rounded-full w-16 h-16 bg-brand-gold text-brand-dark border-none hover:scale-110 transition-transform"
                      onClick={() => setPlayingVideoId(video.videoId)}
                    >
                      <Play className="ml-1 fill-current" size={32} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-brand-gold text-xs uppercase tracking-widest font-bold">
                  <span>{video.category}</span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span className="text-gray-400 font-normal">
                    {video.releaseDate}
                  </span>
                </div>
                <h3 className="text-2xl font-header font-bold text-white uppercase leading-tight group-hover:text-brand-gold transition-colors">
                  {video.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />

      <VideoModal
        isOpen={!!playingVideoId}
        onClose={() => setPlayingVideoId(null)}
        videoId={playingVideoId || ""}
      />
    </div>
  );
}
