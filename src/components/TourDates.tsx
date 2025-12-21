import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "./ui/Button";

interface TourDate {
  id: number;
  date: string;
  month: string;
  venue: string;
  city: string;
  country: string;
  status: "available" | "selling-fast" | "sold-out";
  ticketLink: string;
}

const tourDates: TourDate[] = [
  {
    id: 1,
    date: "12",
    month: "DEC",
    venue: "O2 Arena",
    city: "London",
    country: "UK",
    status: "sold-out",
    ticketLink: "#",
  },
  {
    id: 2,
    date: "18",
    month: "DEC",
    venue: "Accor Arena",
    city: "Paris",
    country: "France",
    status: "selling-fast",
    ticketLink: "#",
  },
  {
    id: 3,
    date: "24",
    month: "DEC",
    venue: "Eko Convention Center",
    city: "Lagos",
    country: "Nigeria",
    status: "selling-fast",
    ticketLink: "#",
  },
  {
    id: 4,
    date: "31",
    month: "DEC",
    venue: "Madison Square Garden",
    city: "New York",
    country: "USA",
    status: "available",
    ticketLink: "#",
  },
];

export function TourDates() {
  return (
    <section className="py-24 bg-brand-dark relative">
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
          <Button variant="outline" withArrow>
            View All Dates
          </Button>
        </motion.div>

        <div className="flex flex-col">
          {tourDates.map((date, index) => (
            <motion.div
              key={date.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group border-t border-white/10 py-8 hover:bg-white/5 transition-colors duration-300 px-4"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                {/* Date */}
                <div className="flex flex-col items-center md:items-start min-w-[100px]">
                  <span className="font-header text-3xl font-bold text-white group-hover:text-brand-gold transition-colors">
                    {date.date}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    {date.month}
                  </span>
                </div>

                {/* Venue & Location */}
                <div className="flex-1 text-center md:text-left md:pl-10">
                  <h4 className="font-header text-2xl md:text-3xl text-white mb-2">
                    {date.city}{" "}
                    <span className="text-gray-500 text-lg align-middle mx-2">
                      •
                    </span>{" "}
                    <span className="text-gray-400 text-xl font-body">
                      {date.country}
                    </span>
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 text-sm uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <MapPin size={14} /> {date.venue}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="min-w-[180px] flex justify-center md:justify-end">
                  {date.status === "sold-out" ? (
                    <span className="inline-block px-4 py-2 border border-white/20 text-gray-400 font-bold uppercase text-xs tracking-widest rounded-sm">
                      Sold Out
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={
                        date.status === "selling-fast" ? "primary" : "outline"
                      }
                      className={
                        date.status === "selling-fast" ? "animate-pulse" : ""
                      }
                    >
                      {date.status === "selling-fast"
                        ? "Last Tickets"
                        : "Buy Tickets"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}
