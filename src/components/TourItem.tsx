import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import type { Tour } from "../lib/tours";

interface TourItemProps {
  show: Tour;
  isEven: boolean;
}

export function TourItem({ show, isEven }: TourItemProps) {
  const isSoldOut = show.status === "SOLD OUT";

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "flex flex-col md:flex-row items-center gap-12 group",
        !isEven && "md:flex-row-reverse text-right"
      )}
    >
      {/* Immersive City Image */}
      <div className="w-full md:w-1/2 relative">
        <div className="aspect-[4/5] md:aspect-square overflow-hidden rounded-sm border border-white/10 group-hover:border-brand-gold/30 transition-colors duration-500">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 8, ease: "linear" }}
            src={show.image} 
            alt={show.city} 
            className="w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </div>
        
        {/* City Name Overlay (Large) */}
        <div className={cn(
          "absolute -bottom-10 z-20",
          isEven ? "-right-10 md:-right-20" : "-left-10 md:-left-20"
        )}>
          <h4 className="font-header text-6xl md:text-[8rem] font-bold uppercase text-white tracking-tighter leading-none pointer-events-none drop-shadow-2xl">
            {show.city}.
          </h4>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="w-full md:w-1/2 space-y-8 relative py-12 px-6 border-y md:border-y-0 border-white/10">
        <div className="flex flex-col gap-2">
          <div className={cn("flex items-center gap-3 mb-2", !isEven && "justify-end")}>
            <span className="w-4 h-[1px] bg-brand-gold" />
            <span className="font-header text-brand-gold text-xs tracking-[0.3em] uppercase">{show.type}</span>
          </div>
          <div className={cn("flex items-end gap-4", !isEven && "flex-row-reverse")}>
             <h5 className="font-header text-6xl md:text-8xl font-bold leading-none">{show.date}</h5>
             <span className="font-body text-gray-500 text-xl font-light underline decoration-brand-gold/30 mb-2">{show.year}</span>
          </div>
          <p className="font-serif text-2xl text-gray-300 italic flex items-center gap-2 group-hover:text-white transition-colors">
            <MapPin size={24} className="text-brand-gold" />
            {show.venue}
          </p>
        </div>

        <div className={cn("flex flex-col gap-4 relative", !isEven && "items-end")}>
          {isSoldOut ? (
            <motion.div 
               initial={{ rotate: -15, scale: 2, opacity: 0 }}
               whileInView={{ rotate: -10, scale: 1, opacity: 1 }}
               className="border-4 border-brand-gold text-brand-gold font-header text-2xl uppercase font-black px-6 py-2 tracking-widest rounded-md bg-brand-gold/5 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              Sold Out
            </motion.div>
          ) : (
            <>
              {/* <p className="font-body text-gray-400 text-sm tracking-widest uppercase">From {show.price}</p> */}
              <Button 
                variant="primary" 
                className="group/btn relative overflow-hidden h-14 w-full md:w-64"
                onClick={() => window.open(show.url, '_blank')}
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 group-hover/btn:text-black flex items-center justify-center gap-2">
                  Secure Passage <ChevronRight size={18} />
                </span>
              </Button>
            </>
          )}
        </div>
        
        {/* Ticket Perforation Mask Effect (Pseudo) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block opacity-10">
           <div className="flex flex-col gap-2">
             {[...Array(10)].map((_, i) => <div key={i} className="w-1 h-2 bg-white rounded-full" />)}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
