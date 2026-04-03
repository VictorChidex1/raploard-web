import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Shield,
  BookOpen,
  Scale,
  AlertCircle,
  ChevronDown,
  Gavel,
  History,
  Printer,
} from "lucide-react";
import { cn } from "../lib/utils";
import { CONFIG } from "../config";
import { Helmet } from "react-helmet-async";

const TOS_SECTIONS = [
  {
    id: "agreement",
    icon: BookOpen,
    title: "The Agreement",
    content: `By accessing the ${CONFIG.artist.name} digital platform, you enter into a binding accord with ${CONFIG.artist.name} Music. This platform is a curated space for art and excellence; by using it, you manifest your agreement to these terms in their entirety. If you do not align with this vision, we respectfully ask that you refrain from further interaction with the ecosystem.`,
  },
  {
    id: "intellectual-property",
    icon: Shield,
    title: "Intellectual Property",
    content: `All content—including but not limited to audio recordings (Sonic Vault), visual imagery, trademarked iconography (Raploard Gold), and proprietary code—is the exclusive intellectual property of ${CONFIG.artist.name}. Unauthorized duplication, redistribution, or digital scraping of these assets is strictly prohibited and protected by international copyright jurisdictions.`,
  },
  {
    id: "user-conduct",
    icon: AlertCircle,
    title: "User Conduct",
    content: `The movement is built on mutual respect. Users are prohibited from attempting to breach the vault security, injecting malicious scripts, or utilizing automated bots for newsletter/RSVP spamming. Any behavior that compromises the integrity of the digital interface or the experience of other fans will result in a permanent blacklisting from all future releases and events.`,
  },
  {
    id: "liability",
    icon: Scale,
    title: "Limitation of Liability",
    content: `${CONFIG.artist.name} Music and its architectural partners provide this platform on an 'as-is' basis. While we strive for absolute perfection, we do not warrant that the digital interface will be uninterrupted or error-free. We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of this luxury digital environment.`,
  },
  {
    id: "modifications",
    icon: History,
    title: "Protocol Evolution",
    content: `The digital landscape is dynamic. We reserve the unilateral right to evolve these terms at any moment to reflect new security standards or artistic directions. Your continued presence within the ecosystem following such updates constitutes your acceptance of the evolved protocol.`,
  },
  {
    id: "governing-law",
    icon: Gavel,
    title: "Jurisdiction",
    content: `These terms are governed by and construed in accordance with the laws of the jurisdiction in which ${CONFIG.artist.name} Music is headquartered, without regard to conflict of law principles. Any formal disputes shall be resolved exclusively within the elite courts of said jurisdiction.`,
  },
];

export function TermsOfService() {
  const [activeSection, setActiveSection] = useState(TOS_SECTIONS[0].id);
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    TOS_SECTIONS[0].id
  );

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = TOS_SECTIONS.map((sec) =>
        document.getElementById(sec.id)
      );
      const scrollPosition = window.scrollY + 150;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(TOS_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-gold selection:text-brand-dark relative">
      <Helmet>
        <title>The Accord | Terms of Service</title>
        <meta
          name="description"
          content="The governing terms and conditions for interacting with the Raploard platform and its digital assets. Excellence and integrity in every interaction."
        />
        <meta property="og:title" content="The Accord | Terms of Service" />
        <meta
          property="og:description"
          content="The governing terms and conditions for interacting with the Raploard platform and its digital assets. Excellence and integrity in every interaction."
        />
        <meta property="og:image" content="/raploard-hero.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-brand-gold origin-left z-[60]"
        style={{ scaleX }}
      />
      <Navbar />

      {/* The Accord Header */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 px-6 relative overflow-hidden">
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
                The Accord
              </span>
            </div>
            <h1 className="font-header text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.9] mb-8">
              Terms of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                Engagement.
              </span>
            </h1>
            <div className="inline-block border border-white/10 bg-white/5 py-2 px-4 rounded-sm backdrop-blur-sm mb-12">
              <p className="font-body text-xs md:text-sm text-gray-400 font-medium tracking-widest uppercase">
                VERSION 1.0 | EFFECTIVE:{" "}
                <span className="text-white">APRIL 1, 2026</span>
              </p>
            </div>

            {/* TL;DR Executive Summary */}
            <div className="max-w-2xl border-l-2 border-brand-gold pl-6">
              <h3 className="font-serif text-2xl md:text-3xl text-gray-200 mb-6 italic">
                "Excellence is our standard."
              </h3>
              <ul className="space-y-3 font-body text-sm md:text-base text-gray-400 mb-4">
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">01.</span> Respect
                  the art; do not steal or replicate our content.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">02.</span>{" "}
                  Maintain the integrity of this digital ecosystem.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">03.</span> We
                  evolve—expect these terms to do the same.
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pb-32 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row gap-16 relative">
          {/* Desktop Sticky Index */}
          <div className="hidden md:block w-1/4">
            <div className="sticky top-32 flex flex-col gap-2 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-6 rounded-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-header text-xs text-gray-500 tracking-[0.2em] uppercase">
                  The Codex
                </h4>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-xs font-header tracking-wider uppercase text-brand-gold hover:text-white transition-colors border border-brand-gold/30 hover:border-white/50 px-3 py-1.5 rounded-sm"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>
              </div>
              {TOS_SECTIONS.map((section) => {
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

          {/* Content Area */}
          <div className="hidden md:block w-3/4 space-y-24">
            {TOS_SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                }}
                className="scroll-mt-32 relative"
              >
                {/* Large Background Number */}
                <span className="absolute -left-12 -top-12 font-serif text-[12rem] text-white/[0.02] pointer-events-none select-none">
                  0{index + 1}
                </span>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-brand-gold" />
                  </div>
                  <h2 className="font-header text-3xl uppercase tracking-wide">
                    {section.title}
                  </h2>
                </motion.div>
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="font-body text-lg text-gray-300 leading-relaxed md:leading-[2] font-light max-w-2xl"
                >
                  {section.content}
                </motion.p>
              </motion.div>
            ))}
          </div>

          {/* Mobile Accordion View */}
          <div className="md:hidden w-full flex flex-col gap-4">
            {TOS_SECTIONS.map((section, index) => {
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
