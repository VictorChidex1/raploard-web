import { motion } from "framer-motion";
import { Play, Music2, ExternalLink } from "lucide-react";
import { Button } from "./ui/Button";

interface Release {
  title: string;
  highlight: string;
  tag: string;
  description: string;
  image: string;
  releaseDate: string; // NEW: Added release date
  links: {
    stream: string;
    spotify: string;
    apple: string;
    youtube: string;
    audiomack: string;
  };
}

const releases: Release[] = [
  {
    title: "Carry",
    highlight: "Go",
    tag: "New Release",
    description: `Afrobeats powerhouse RapLoard ushers in the festive season with "Carry Go," his essential December jam. Built on an infectious rhythm and an undeniable call to celebration, the track is a pure energy boost. It’s a command to dance, a soundtrack for merriment, and RapLoard's vibrant gift to the global audience. Let the rhythm move you to carry go and celebrate.`,
    image: "/carry-go.jpg",
    releaseDate: "Dec 20, 2024",
    links: {
      stream: "https://ffm.to/carrygo",
      spotify: "https://open.spotify.com/track/0NgdKtTbEG736AqdRBQZNc?si=1",
      apple:
        "https://music.apple.com/ng/album/carry-go/1859963821?i=1859963822&at=1001lwQy&ct=FFM_b1faf35082379e69225f24dd9fdbf351&ls=1&uo=4",
      youtube: "https://www.youtube.com/watch?v=sSmbe38S4UE",
      audiomack:
        "https://audiomack.com/raploard/song/carry-go?utm_source=featurefm&utm_campaign=onelink&utm_medium=website&ffm=FFM_29b2095c911b1d7f9b36a43bb439a6c8",
    },
  },
  {
    title: "Ella",
    highlight: "",
    tag: "Hit Single",
    description:
      "RapLoard shifts the tempo to deliver 'Ella', a radiant and heartfelt love song. Stripping back the high-energy festivity, he trades dancefloor commands for intimate melodies and earnest lyrics. This smooth, captivating track is a pure dedication, showcasing RapLoard's versatility as he crafts a timeless serenade for that special someone. 'Ella' is the sound of affection, perfectly distilled.",
    image: "/raploard-ella.jpeg",
    releaseDate: "Nov 14, 2024",
    links: {
      stream: "https://ffm.to/ellla",
      spotify:
        "https://open.spotify.com/track/0EKDdAQWiLHo5lMTWcX3cp?si=1ec5691350f14a77&nd=1&dlsi=9fcbe7a08aa84bb4",
      apple:
        "https://music.apple.com/ng/album/ella-single/1854306271?at=1001lwQy&ct=FFM_955cac0ccf625fb61f31e14529b12313&ls=1&uo=4",
      youtube: "https://music.youtube.com/watch?v=HLLUCmkZY6w",
      audiomack:
        "https://audiomack.com/raploard/song/ella?ffm=FFM_91241255c55c4d5746b4f5ff90e44cf5",
    },
  },
  {
    title: "Deep Down",
    highlight: "",
    tag: "Hit Single",
    description:
      "RapLoard shifts the tempo to deliver 'Ella', a radiant and heartfelt love song. Stripping back the high-energy festivity, he trades dancefloor commands for intimate melodies and earnest lyrics. This smooth, captivating track is a pure dedication, showcasing RapLoard's versatility as he crafts a timeless serenade for that special someone. 'Ella' is the sound of affection, perfectly distilled.",
    image: "/raploard-ella.jpeg",
    releaseDate: "Jun 28, 2024",
    links: {
      stream: "https://ffm.to/deep_down",
      spotify: "https://open.spotify.com/track/0ssCsieQQ7H3FbJXv5PuzM",
      apple:
        "https://music.apple.com/ng/album/deep-down/1754051323?i=1754051324",
      youtube: "https://youtu.be/lpSNfx7jYJc?si=ShHNFvslPO0oktK8",
      audiomack:
        "https://audiomack.com/raploard/song/deep-down?utm_source=featurefm&utm_campaign=onelink&utm_medium=website&ffm=FFM_7665fcb007bb37505b959798d45fcea9",
    },
  },
];

export function LatestRelease() {
  return (
    <section className="py-24 bg-brand-dark/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 space-y-32">
        {releases.map((release, index) => (
          <motion.div
            key={release.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Cover Art */}
            <div className="w-full md:w-1/2 relative group">
              <div className="relative aspect-square overflow-hidden rounded-sm border border-white/10 shadow-2xl">
                <img
                  src={release.image}
                  alt={`${release.title} Cover`}
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
                <div className="flex items-center gap-4">
                  <h2 className="text-brand-gold font-bold uppercase tracking-widest text-sm">
                    {release.tag}
                  </h2>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-gray-400 text-xs tracking-widest uppercase">
                    Released: {release.releaseDate}
                  </span>
                </div>
                <h3 className="font-header text-5xl md:text-7xl font-bold text-white uppercase leading-none">
                  {release.title} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white">
                    {release.highlight}
                  </span>
                </h3>
              </div>

              <p className="text-gray-400 text-lg max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
                {release.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <a
                  href={release.links.stream || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    !release.links.stream
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                >
                  <Button size="lg" className="min-w-[180px]">
                    <Music2 className="mr-2 h-5 w-5" />
                    Stream Now
                  </Button>
                </a>
                <a
                  href={release.links.stream || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    !release.links.stream
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                >
                  <Button size="lg" variant="outline" className="min-w-[180px]">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Other Platforms
                  </Button>
                </a>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-8 pt-8 opacity-60">
                <a
                  href={release.links.spotify || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-bold tracking-widest uppercase hover:text-brand-gold transition-colors ${
                    !release.links.spotify ? "pointer-events-none" : ""
                  }`}
                >
                  Spotify
                </a>
                <a
                  href={release.links.apple || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-bold tracking-widest uppercase hover:text-brand-gold transition-colors ${
                    !release.links.apple ? "pointer-events-none" : ""
                  }`}
                >
                  Apple Music
                </a>
                <a
                  href={release.links.youtube || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-bold tracking-widest uppercase hover:text-brand-gold transition-colors ${
                    !release.links.youtube ? "pointer-events-none" : ""
                  }`}
                >
                  Youtube
                </a>
                <a
                  href={release.links.audiomack || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-bold tracking-widest uppercase hover:text-brand-gold transition-colors ${
                    !release.links.audiomack ? "pointer-events-none" : ""
                  }`}
                >
                  Audiomack
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
