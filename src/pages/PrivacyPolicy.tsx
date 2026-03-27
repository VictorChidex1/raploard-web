import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Eye,
  Database,
  Lock,
  ChevronDown,
  Activity,
  Mail,
} from "lucide-react";
import { cn } from "../lib/utils";
import { CONFIG } from "../config";

const POLICY_SECTIONS = [
  {
    id: "collection",
    icon: Database,
    title: "Data Collection",
    content: `When you interact with the ${CONFIG.artist.name} digital ecosystem, we collect intentional data points to elevate your experience. This includes email addresses provided voluntarily for the 'Join The Movement' newsletter, RSVP details for exclusive events, and anonymous usage metrics. We do not stealth-harvest personal data; every piece of information collected is a mutual exchange for premium access.`,
  },
  {
    id: "usage",
    icon: Activity,
    title: "Information Usage",
    content: `Your data powers the engine. We utilize the information collected strictly to communicate upcoming releases, exclusive tour pre-sales, and curated merchandise drops. We analyze aggregate traffic patterns to optimize the speed and design of this digital interface. Your information is never used to train external AI models or sold to third-party data brokers.`,
  },
  {
    id: "cookies",
    icon: Eye,
    title: "The Cookie Protocol",
    content: `This platform employs minimal, essential cookies. These exist solely to maintain your session integrity, remember your preferences (like volume settings in the Sonic Vault), and ensure the architecture operates at maximum efficiency. You maintain full sovereignty over your browser settings and may disable non-essential trackers at any time without losing core functionality.`,
  },
  {
    id: "security",
    icon: Shield,
    title: "Vault Security",
    content: `We treat your data with the classification it deserves. All newsletter subscriptions and RSVP entries are encrypted and stored within Google's Firebase infrastructure, protected by stringent, role-based Firestore Security Rules. Access is restricted exclusively to authorized personnel for the purpose of direct communication.`,
  },
  {
    id: "rights",
    icon: Lock,
    title: "Your Sovereignty",
    content: `You retain ultimate control over your digital footprint within our ecosystem. You reserve the right to request a complete export of your stored data, demand immediate deletion from our ledgers, or instantly unsubscribe from all communications via the automated link provided in every encrypted dispatch.`,
  },
  {
    id: "contact",
    icon: Mail,
    title: "Direct Comm",
    content: `For any inquiries regarding this protocol, data erasure requests, or security concerns, direct your communications exclusively to our compliance channel: ${CONFIG.contact.email}. Responses will be handled with appropriate urgency and discretion.`,
  },
];

export function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(POLICY_SECTIONS[0].id);
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    POLICY_SECTIONS[0].id
  );

  // Smooth scroll handler for Desktop sidebar
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120; // 120px offset for sticky header considerations
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Intersection Observer to update active sidebar link on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = POLICY_SECTIONS.map((sec) =>
        document.getElementById(sec.id)
      );
      const scrollPosition = window.scrollY + 150; // Offset trigger point

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(POLICY_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-gold selection:text-brand-dark">
      <Navbar />

      {/* The Protocol Header */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 px-6 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-8 bg-brand-gold" />
              <span className="font-header text-brand-gold tracking-[0.3em] text-sm md:text-base uppercase">
                The Protocol
              </span>
            </div>
            <h1 className="font-header text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.9] mb-8">
              Your Data <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                Is Secure.
              </span>
            </h1>
            <div className="inline-block border border-white/10 bg-white/5 py-2 px-4 rounded-sm backdrop-blur-sm">
              <p className="font-body text-xs md:text-sm text-gray-400 font-medium tracking-widest uppercase">
                Last Revised: <span className="text-white">April 2026</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area: Split View */}
      <section className="pb-32 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row gap-16 relative">
          {/* Desktop Sticky Index (Left Sidebar) */}
          <div className="hidden md:block w-1/4">
            <div className="sticky top-32 flex flex-col gap-2">
              <h4 className="font-header text-xs text-gray-500 tracking-[0.2em] uppercase mb-4 ml-4">
                The Index
              </h4>
              {POLICY_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "text-left py-3 px-4 rounded-sm transition-all duration-300 flex items-center gap-3 group border-l-2",
                      isActive
                        ? "border-brand-gold bg-brand-gold/5 text-white"
                        : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    )}
                  >
                    <section.icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-brand-gold"
                          : "text-gray-600 group-hover:text-gray-400"
                      )}
                    />
                    <span className="font-body text-sm font-medium tracking-wider">
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Content Area (Right Side) */}
          <div className="hidden md:block w-3/4 space-y-24">
            {POLICY_SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-brand-gold" />
                  </div>
                  <h2 className="font-header text-3xl uppercase tracking-wide">
                    <span className="text-brand-gold mr-3">0{index + 1}.</span>
                    {section.title}
                  </h2>
                </div>
                <p className="font-body text-lg text-gray-300 leading-[1.8] font-light max-w-2xl">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mobile Accordion View (Only visible on small screens) */}
          <div className="md:hidden w-full flex flex-col gap-4">
            {POLICY_SECTIONS.map((section, index) => {
              const isOpen = openAccordion === section.id;

              return (
                <div
                  key={section.id}
                  className="border border-white/10 bg-black/40 rounded-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-header text-brand-gold text-lg">
                        0{index + 1}.
                      </span>
                      <span className="font-header text-xl uppercase tracking-wide">
                        {section.title}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown
                        className={cn(
                          "w-5 h-5",
                          isOpen ? "text-brand-gold" : "text-gray-500"
                        )}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-white/5 mt-2">
                          <p className="font-body text-base text-gray-400 leading-relaxed font-light">
                            {section.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
