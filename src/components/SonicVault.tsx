import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "./ui/Button";

export function SonicVault() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); // Default to 0 until loaded
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio Source - User needs to drop this file in public folder
  const AUDIO_SRC = "/carry-go.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // --- VISUALIZER BARS CONFIG ---
  const barCount = 24;
  const bars = Array.from({ length: barCount });

  return (
    <section className="bg-brand-dark border-y border-white/5 relative overflow-hidden">
      <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" />

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* LEFT: Metadata & Branding */}
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="relative group">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                <img
                  src="/carry-go.jpg"
                  alt="Carry Go Art"
                  className={`w-full h-full object-cover transition-transform duration-[3s] ${
                    isPlaying ? "scale-110" : "scale-100"
                  }`}
                />
              </div>
              {/* Spinning Disc Effect Overlay */}
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-tr from-black/20 to-transparent pointer-events-none`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                  Sonic Vault
                </p>
              </div>
              <h3 className="text-2xl font-header font-bold text-white uppercase tracking-tight">
                Carry Go <span className="text-brand-gold">.mp3</span>
              </h3>
              <p className="text-sm text-gray-400 font-mono hidden md:block">
                RAPLOARD • EXCLUSIVE PREMIERE
              </p>
            </div>
          </div>

          {/* CENTER: Visualizer & Progress */}
          <div className="flex-1 w-full max-w-2xl px-4 flex flex-col justify-center gap-4">
            {/* The Visualizer */}
            <div className="h-12 flex items-end justify-center gap-1">
              {bars.map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-brand-gold rounded-t-full"
                  animate={{
                    height: isPlaying ? ["15%", "100%", "30%"] : "15%",
                    opacity: isPlaying ? 1 : 0.3,
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: i * 0.05, // Stagger effect
                  }}
                />
              ))}
            </div>

            {/* Seek Bar */}
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span className="min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 h-3 group cursor-pointer">
                {/* Background Line */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full" />
                {/* Progress Line */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1 bg-brand-gold rounded-full transition-[width] duration-100 ease-linear"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
                {/* Draggable Input (Invisible but accessible) */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="min-w-[40px]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end gap-4">
            <Button
              size="icon"
              onClick={togglePlay}
              className={`w-14 h-14 rounded-full border-2 ${
                isPlaying
                  ? "border-brand-gold text-brand-gold bg-transparent"
                  : "bg-brand-gold border-brand-gold text-brand-dark"
              }`}
            >
              {isPlaying ? (
                <Pause className="fill-current" />
              ) : (
                <Play className="fill-current ml-1" />
              )}
            </Button>

            <div className="hidden md:flex items-center gap-2 text-gray-500">
              <Volume2 size={18} />
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
