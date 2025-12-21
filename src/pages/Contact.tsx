import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function Contact() {
  return (
    <div className="min-h-screen bg-brand-dark pt-20">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-header text-6xl text-white uppercase">
            Get In <span className="text-brand-gold">Touch</span>
          </h1>
          <p className="text-gray-400 mt-4 text-lg">
            For bookings, press, and collaborations.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-1/3 space-y-8 bg-white/5 p-8 rounded-sm border border-white/5"
          >
            <h3 className="font-header text-2xl text-white uppercase mb-6">
              Management
            </h3>

            <div className="flex items-start gap-4">
              <Mail className="text-brand-gold mt-1" />
              <div>
                <p className="text-gray-500 uppercase text-xs tracking-widest mb-1">
                  Bookings
                </p>
                <a
                  href="mailto:book@raploard.com"
                  className="text-white hover:text-brand-gold transition-colors"
                >
                  book@raploard.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-brand-gold mt-1" />
              <div>
                <p className="text-gray-500 uppercase text-xs tracking-widest mb-1">
                  Phone
                </p>
                <p className="text-white">+234 812 345 6789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="text-brand-gold mt-1" />
              <div>
                <p className="text-gray-500 uppercase text-xs tracking-widest mb-1">
                  Label HQ
                </p>
                <p className="text-white">Lekki Phase 1, Lagos, Nigeria</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full md:w-2/3"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">
                  Subject
                </label>
                <select className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors">
                  <option className="bg-brand-dark">Booking Inquiry</option>
                  <option className="bg-brand-dark">Press / Media</option>
                  <option className="bg-brand-dark">Fan Mail</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                  placeholder="Tell us about your event..."
                />
              </div>

              <Button size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
