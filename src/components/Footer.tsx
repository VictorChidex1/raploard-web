import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/Button";

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
  { name: "Spotify", icon: Music2, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand & Newsletter */}
          <div className="md:col-span-5 space-y-8">
            <Link to="/" className="inline-block">
              <span className="font-header text-4xl font-bold tracking-tighter text-white">
                RAP<span className="text-brand-gold">LOARD</span>
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Join the Vibe. Subscribe to get exclusive updates on toure dates,
              new drops, and merch.
            </p>

            <form className="flex w-full max-w-sm items-center space-x-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 px-10 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <Button size="icon" variant="primary">
                <ArrowRight size={20} />
              </Button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-6">
                Menu
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/music"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Music
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tour"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tour
                  </Link>
                </li>
                <li>
                  <Link
                    to="/videos"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Videos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/store"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Store
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-6">
                Info
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-6">
                Connect
              </h4>
              <div className="flex flex-col gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-brand-gold transition-colors group"
                  >
                    <social.icon
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Raploard Music. All rights
            reserved.
          </p>
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            Designed by Vibe Coding
          </p>
        </div>
      </div>
    </footer>
  );
}
