import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VideoModal } from "../components/ui/VideoModal";

export function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // --- 1. SHARED MOUSE LOGIC ---
  // We need two types of values:
  // A. Pixel values for the Spotlight (e.g., 500px from left)
  const mouseXPixels = useMotionValue(0);
  const mouseYPixels = useMotionValue(0);

  // B. Percentage values for Parallax (e.g., -0.5 is left, 0 is center, 0.5 is right)
  const mouseXPct = useMotionValue(0);
  const mouseYPct = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    // Set Pixels (For Spotlight)
    mouseXPixels.set(clientX - left);
    mouseYPixels.set(clientY - top);

    // Set Percentages (For Parallax)
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    mouseXPct.set(xPct);
    mouseYPct.set(yPct);
  }

  // --- 2. PHYSICS CONFIGURATION ---
  // Spotlight Physics (Snappy)
  const spotlightX = useSpring(mouseXPixels, { damping: 20, stiffness: 300 });
  const spotlightY = useSpring(mouseYPixels, { damping: 20, stiffness: 300 });

  // Parallax Physics (Heavier/Slower for depth feel)
  const parallaxSpringConfig = { stiffness: 100, damping: 30 };

  // Background moves slightly opposite to mouse
  const bgX = useSpring(
    useTransform(mouseXPct, [-0.5, 0.5], ["2%", "-2%"]),
    parallaxSpringConfig
  );
  const bgY = useSpring(
    useTransform(mouseYPct, [-0.5, 0.5], ["2%", "-2%"]),
    parallaxSpringConfig
  );

  // Text moves MORE opposite to mouse (creates layer separation)
  const textX = useSpring(
    useTransform(mouseXPct, [-0.5, 0.5], ["-5%", "5%"]),
    parallaxSpringConfig
  );
  const textY = useSpring(
    useTransform(mouseYPct, [-0.5, 0.5], ["-5%", "5%"]),
    parallaxSpringConfig
  );

  // --- 3. ANIMATION VARIANTS (Cinematic Reveal) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2, // Minimized delay for instant impact
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { y: "100%", opacity: 0 }, // Start fully out of view
    visible: {
      y: 0,
      opacity: 1,
      // The "Cinematic" Curve: Starts fast, lands gently
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-brand-dark group pointer-events-auto flex items-center justify-center" // added flex/center
      onMouseMove={handleMouseMove}
    >
      {/* --- LAYER 1: SPOTLIGHT (Your implementation) --- */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${spotlightX}px ${spotlightY}px,
              rgba(255, 215, 0, 0.10),
              transparent 80%
            )
          `,
        }}
      />

      {/* --- LAYER 2: PARALLAX BACKGROUND --- */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ x: bgX, y: bgY, scale: 1.1 }} // Scale 1.1 prevents edges from showing
      >
        <img
          src="/raploard-hero.jpeg"
          alt="Raploard Hero"
          className="h-full w-full object-cover object-[10%_20%] opacity-80"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 via-40% to-transparent" />
      </motion.div>

      {/* --- LAYER 3: PARALLAX CONTENT --- */}
      <motion.div
        className="relative z-10 flex h-full w-full items-center px-6 container mx-auto"
        style={{ x: textX, y: textY }}
      >
        <div className="max-w-2xl space-y-8 mt-20 md:mt-0">
          {/* Kinetic Typography with Cinematic Reveal */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Row 1: RAP */}
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

            {/* Row 2: LOARD */}
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

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex items-center gap-4 text-xl md:text-2xl font-body font-light tracking-wide text-gray-300"
          >
            <div className="h-[1px] w-12 bg-brand-gold" />
            <span>AFROBEATS SUPERSTAR</span>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
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
      </motion.div>

      {/* Social Proof Ticker (Floating) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 1 },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
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

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId="mr6xYQrywnU"
      />
    </div>
  );
}
