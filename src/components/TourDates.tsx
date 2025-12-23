import { useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react"; // Changed map pin to bell for notification vibe
import { Button } from "./ui/Button";
import { RSVPModal } from "./ui/RSVPModal";

export function TourDates() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="tour" className="py-24 bg-brand-dark relative scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2">
              Live On Stage
            </h2>
            <h3 className="font-header text-5xl md:text-7xl font-bold text-white uppercase leading-none">
              World{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white">
                Tour
              </span>
            </h3>
          </div>
        </motion.div>

        {/* Empty State / RSVP CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <Bell size={40} />
            </div>
          </div>

          <h4 className="text-3xl font-header font-bold text-white uppercase mb-4">
            No Upcoming Shows
          </h4>

          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Sorry, there are no shows currently available. To be notified of new
            tour dates when they are announced, click the RSVP link below.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="min-w-[200px]"
            onClick={() => setIsModalOpen(true)}
          >
            RSVP for Updates
          </Button>
        </motion.div>
      </div>

      <RSVPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
