import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { Button } from "./Button";

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RSVPModal({ isOpen, onClose }: RSVPModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle email submission (e.g., Firebase) would go here
    console.log("Submitted email:", email);
    // Ideally close modal or show success message
    onClose();
    alert("Thanks for subscribing! We'll keep you posted.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center p-8 pt-12 text-center">
              {/* Artist Image */}
              <div className="relative mb-6">
                <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-offset-2 ring-brand-gold">
                  <img
                    src="/raploard.jpeg"
                    alt="Raploard"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <h2 className="font-header text-3xl font-bold uppercase tracking-tight mb-2">
                Raploard
              </h2>

              <h3 className="text-xl font-bold leading-tight mb-8">
                Be the first to know about <br /> new shows near you.
              </h3>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-gray-300 bg-white px-6 py-4 pr-12 text-lg text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 rounded-full bg-black text-white p-3 hover:bg-gray-800 transition-colors"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-sm font-semibold text-gray-600">
                    Subscribe to email updates from:
                  </p>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-black checked:border-black transition-all"
                      />
                      <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-900 group-hover:text-black font-medium">
                      Raploard
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-black checked:border-black transition-all"
                      />
                      <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-900 group-hover:text-black font-medium">
                      Send me concert alerts and updates for similar artists
                    </span>
                  </label>
                </div>

                <div className="text-xs text-gray-500 text-left space-y-2 pt-4 border-t border-gray-100">
                  <p>
                    By proceeding, you agree to receive updates about this
                    artist. You may withdraw your consent at any time.
                  </p>
                  <p>
                    See our{" "}
                    <Link to="/terms" className="underline hover:text-black">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="underline hover:text-black">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>

            {/* Branding Footer */}
            <div className="bg-gray-50 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Raploard Music
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
