import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Music2,
  User,
  Mail,
  Home,
  Video,
  ShoppingBag,
} from "lucide-react";
import { cn } from "../lib/utils";

const navLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Music", path: "/music", icon: Music2 },
  { name: "Videos", path: "/videos", icon: Video },
  { name: "Store", path: "/store", icon: ShoppingBag }, // NEW: Added Store link
  { name: "About", path: "/about", icon: User },
  { name: "Contact", path: "/contact", icon: Mail },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent pt-[env(safe-area-inset-top)]",
          isScrolled
            ? "bg-brand-dark/80 backdrop-blur-xl border-white/5 pb-3"
            : "bg-transparent pb-6"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="relative z-50 group">
            <span className="font-header text-3xl font-bold tracking-tighter text-white group-hover:text-brand-gold transition-colors">
              RAP<span className="text-brand-gold">LOARD</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-semibold uppercase tracking-widest hover:text-brand-gold transition-colors relative",
                  location.pathname === link.path
                    ? "text-brand-gold"
                    : "text-gray-300"
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden z-50 text-white hover:text-brand-gold transition-colors"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-brand-dark flex flex-col items-center justify-center md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      "text-3xl font-header font-bold uppercase tracking-widest hover:text-brand-gold transition-colors flex items-center justify-center gap-3",
                      location.pathname === link.path
                        ? "text-brand-gold"
                        : "text-white"
                    )}
                  >
                    <link.icon className="w-6 h-6" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
