import { useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VideoModal } from "../components/ui/VideoModal";

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Mouse position state for Spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the spotlight so it doesn't feel jittery
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.5 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { clientX, clientY } = e;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-brand-dark group pointer-events-auto"
      onMouseMove={handleMouseMove}
    >
      {/* Cinematic Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${smoothX}px ${smoothY}px,
              rgba(255, 215, 0, 0.10),
              transparent 80%
            )
          `,
        }}
      />

      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/raploard-hero.jpeg"
          alt="Raploard Hero"
          className="h-full w-full object-cover object-[10%_20%] opacity-80"
        />
        {/* Bottom fade for smooth transition to next section */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
        {/* Strong Left Gradient to make text readable and face bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 via-40% to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 container mx-auto">
        <div className="max-w-2xl space-y-8 mt-20 md:mt-0">
          {/* Kinetic Typography Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            <div className="flex overflow-hidden">
              {["R", "A", "P"].map((letter, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  className="font-header text-[clamp(4rem,12vw,10rem)] font-bold uppercase leading-[0.9] text-white tracking-tighter"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <div className="flex overflow-hidden">
              {["L", "O", "A", "R", "D"].map((letter, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  className="font-header text-[clamp(4rem,12vw,10rem)] font-bold uppercase leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-600 tracking-tighter"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Subtitle Line */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-4 text-xl md:text-2xl font-body font-light tracking-wide text-gray-300"
          >
            <div className="h-[1px] w-12 bg-brand-gold" />
            <span>AFROBEATS SUPERSTAR</span>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-6 pt-8"
          >
            <a
              href="https://ffm.to/carrygo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" withArrow>
                Stream Latest Hit
              </Button>
            </a>

            <button
              onClick={() => setIsVideoOpen(true)}
              className="group flex items-center gap-4 text-white transition-colors duration-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-brand-gold group-hover:border-brand-gold group-hover:text-brand-dark">
                <Play className="h-6 w-6 ml-1 fill-current" />
              </div>
              <span className="text-lg font-bold uppercase tracking-widest group-hover:text-brand-gold">
                Watch Video
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Social Proof / Ticker (Breathing Animation) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 1 },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" }, // Floating effect
        }}
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
        videoId="mr6xYQrywnU" // Carry Go YouTube Short
      />
    </div>
  );
}
