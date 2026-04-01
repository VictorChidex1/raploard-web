import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Mail,
  Music2,
  LogOut,
  Download,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { db, auth } from "../lib/firebase";
import { CONFIG } from "../config";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActiveTab = "overview" | "subscribers" | "rsvps" | "contacts" | "spotify";

interface Subscriber {
  id: string;
  email: string;
  timestamp: Timestamp;
  source: "website_footer" | "rsvp_modal";
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Timestamp;
}

interface SpotifyDoc {
  latestRelease?: {
    name: string;
    type: string;
    spotifyId: string;
    releaseDate: string;
    artistName: string;
    spotifyUrl: string;
    images?: { url: string; width: number; height: number }[];
  };
  _sync?: {
    syncedAt: Timestamp;
    source: string;
  };
}

// ─── Helper: Animated Counter ──────────────────────────────────────────────

function useAnimatedCounter(target: number, durationMs = 1200): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return count;
}

// ─── Helper: Live Clock ────────────────────────────────────────────────────

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ─── Helper: CSV Export ────────────────────────────────────────────────────

function exportCSV(rows: Record<string, string>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(",");
  const body = rows
    .map((r) => Object.values(r).map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([`${headers}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sidebar Navigation Config ────────────────────────────────────────────

const NAV_ITEMS: { id: ActiveTab; label: string; Icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "subscribers", label: "Subscribers", Icon: Users },
  { id: "rsvps", label: "Tour RSVPs", Icon: MapPin },
  { id: "contacts", label: "Contacts", Icon: Mail },
  { id: "spotify", label: "Spotify", Icon: Music2 },
];

// ─── Sub-components ───────────────────────────────────────────────────────

// ─── Decorative Sparkline ──────────────────────────────────────────────────
function SparklinePulse() {
  return (
    <svg
      className="absolute bottom-0 right-0 w-full h-1/2 opacity-10 pointer-events-none"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      fill="none"
    >
      <motion.path
        d="M0 30 Q10 25 20 28 T40 15 T60 20 T80 5 T100 15 L100 30 L0 30 Z"
        fill="url(#gold-gradient)"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="gold-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number;
  sublabel: string;
}) {
  const count = useAnimatedCounter(value);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white/[0.015] border border-white/[0.04] rounded-sm p-6 overflow-hidden backdrop-blur-xl group"
      style={{ borderTop: "1px solid rgba(255, 215, 0, 0.15)" }}
    >
      {/* Dynamic Gold Glow on Hover */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/[0.02] rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150 group-hover:bg-brand-gold/[0.04]" />
      
      {/* Pulse Line */}
      <SparklinePulse />

      <p className="font-header text-white/35 text-[10px] tracking-[0.25em] uppercase mb-3 relative z-10 text-shadow-sm">
        {label}
      </p>
      {/* Using Editorial Typography (Playfair Display) for Numbers */}
      <p className="font-serif italic text-white text-6xl tabular-nums tracking-tight relative z-10">
        {count}
      </p>
      <p className="text-white/25 text-xs mt-3 relative z-10">
        {sublabel}
      </p>
    </motion.div>
  );
}

function SectionHeader({
  title,
  count,
  onExport,
}: {
  title: string;
  count: number;
  onExport: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="font-header text-white text-xl uppercase tracking-wider">
          {title}
        </h2>
        <span className="bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-header px-2 py-0.5 rounded-sm">
          {count}
        </span>
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 text-white/30 hover:text-brand-gold text-xs font-header tracking-widest uppercase transition-colors duration-200 border border-white/[0.06] hover:border-brand-gold/30 px-3 py-1.5 rounded-sm"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
    </div>
  );
}

function TableRow({
  children,
  onClick,
  isExpanded = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isExpanded?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`grid px-4 py-4 border-b border-white/[0.03] text-sm transition-colors duration-150 relative overflow-hidden group ${
        onClick ? "cursor-pointer" : ""
      } ${isExpanded ? "bg-white/[0.02]" : ""}`}
    >
      {/* Subtle gold line accent that slides in on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-brand-gold/0 group-hover:bg-brand-gold/60 transition-colors duration-300" />
      {children}
    </motion.div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid px-4 py-2.5 border-b border-white/[0.08] text-[10px] font-header tracking-[0.2em] text-white/30 uppercase">
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-white/20 text-xs font-header tracking-widest uppercase">{message}</p>
    </div>
  );
}

function formatDate(ts: Timestamp | undefined): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Main Component ────────────────────────────────────────────────────────

export function Admin() {
  const navigate = useNavigate();
  const clock = useLiveClock();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [spotify, setSpotify] = useState<SpotifyDoc | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Derived data
  const newsletterSubs = subscribers.filter((s) => s.source === "website_footer");
  const rsvps = subscribers.filter((s) => s.source === "rsvp_modal");

  // ── Real-time Firestore listeners ─────────────────────────────────────
  useEffect(() => {
    const qNewsletter = query(
      collection(db, "newsletter"),
      orderBy("timestamp", "desc")
    );

    const unsubNewsletter = onSnapshot(
      qNewsletter,
      (snap) => {
        setSubscribers(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscriber))
        );
        setIsLive(true);
      },
      () => setIsLive(false)
    );

    const qContacts = query(
      collection(db, "contacts"),
      orderBy("timestamp", "desc")
    );

    const unsubContacts = onSnapshot(
      qContacts,
      (snap) => {
        setContacts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact))
        );
      }
    );

    const unsubSpotify = onSnapshot(
      doc(db, "integrations", "spotify"),
      (snap) => {
        if (snap.exists()) setSpotify(snap.data() as SpotifyDoc);
      }
    );

    return () => {
      unsubNewsletter();
      unsubContacts();
      unsubSpotify();
    };
  }, []);

  // ── Auto-logout on 30 min idle ────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    // Stored in a closure — reset every user interaction
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await signOut(auth);
        navigate("/admin/login", { replace: true });
      }, 30 * 60 * 1000);
    };

    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("touchstart", reset);
    reset(); // start the timer immediately

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, [navigate, resetIdleTimer]);

  // ── Logout ────────────────────────────────────────────────────────────
  async function handleLogout() {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  }

  // ── CSV Exports ───────────────────────────────────────────────────────
  function exportSubscribers() {
    exportCSV(
      newsletterSubs.map((s) => ({
        email: s.email,
        source: s.source,
        date: formatDate(s.timestamp),
      })),
      "raploard-newsletter-subscribers.csv"
    );
  }

  function exportRSVPs() {
    exportCSV(
      rsvps.map((r) => ({
        email: r.email,
        source: r.source,
        date: formatDate(r.timestamp),
      })),
      "raploard-tour-rsvps.csv"
    );
  }

  function exportContacts() {
    exportCSV(
      contacts.map((c) => ({
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message.replace(/"/g, "'"),
        date: formatDate(c.timestamp),
      })),
      "raploard-contacts.csv"
    );
  }

  // ─── Clock format ───────────────────────────────────────────────────
  const clockStr = clock.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = clock.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();

  // ─── Content sections ─────────────────────────────────────────────────

  function renderOverview() {
    return (
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Newsletter"
            value={newsletterSubs.length}
            sublabel="Total subscribers"
          />
          <MetricCard
            label="Tour RSVPs"
            value={rsvps.length}
            sublabel="Live Circuit interest"
          />
          <MetricCard
            label="Inquiries"
            value={contacts.length}
            sublabel="Contact form total"
          />
          <div
            className="relative bg-white/[0.025] border border-white/[0.06] rounded-sm p-6 overflow-hidden"
            style={{ borderTop: "1px solid rgba(255, 215, 0, 0.15)" }}
          >
            <p className="font-header text-white/35 text-[10px] tracking-[0.25em] uppercase mb-3">
              Spotify
            </p>
            {spotify?.latestRelease ? (
              <>
                <p className="font-header text-brand-gold text-lg uppercase leading-tight">
                  {spotify.latestRelease.name}
                </p>
                <p className="text-white/30 text-xs mt-1">
                  {spotify.latestRelease.type} · {spotify.latestRelease.releaseDate}
                </p>
              </>
            ) : (
              <p className="text-white/20 text-xs mt-2">No data synced</p>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest subscribers */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm">
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h3 className="font-header text-white/60 text-xs tracking-widest uppercase">
                Latest Subscribers
              </h3>
            </div>
            {newsletterSubs.slice(0, 5).map((s) => (
              <div key={s.id} className="flex justify-between items-center px-5 py-3 border-b border-white/[0.03] last:border-b-0">
                <p className="text-white/60 text-sm truncate max-w-[200px]">{s.email}</p>
                <p className="text-white/20 text-xs shrink-0 ml-2">{formatDate(s.timestamp)}</p>
              </div>
            ))}
            {newsletterSubs.length === 0 && <EmptyState message="No subscribers yet" />}
          </div>

          {/* Latest contacts */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm">
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h3 className="font-header text-white/60 text-xs tracking-widest uppercase">
                Latest Inquiries
              </h3>
            </div>
            {contacts.slice(0, 5).map((c) => (
              <div key={c.id} className="flex justify-between items-center px-5 py-3 border-b border-white/[0.03] last:border-b-0">
                <div className="min-w-0">
                  <p className="text-white/60 text-sm truncate">{c.name}</p>
                  <p className="text-white/25 text-xs">{c.subject}</p>
                </div>
                <p className="text-white/20 text-xs shrink-0 ml-2">{formatDate(c.timestamp)}</p>
              </div>
            ))}
            {contacts.length === 0 && <EmptyState message="No contacts yet" />}
          </div>
        </div>
      </div>
    );
  }

  function renderSubscribers() {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm">
        <div className="p-5 border-b border-white/[0.05]">
          <SectionHeader
            title="Newsletter Subscribers"
            count={newsletterSubs.length}
            onExport={exportSubscribers}
          />
        </div>
        <TableHead>
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <span>Email</span>
            <span>Date</span>
          </div>
        </TableHead>
        {newsletterSubs.length === 0 && <EmptyState message="No subscribers yet" />}
        {newsletterSubs.map((s) => (
          <TableRow key={s.id}>
            <div className="grid grid-cols-[1fr_120px] gap-4 items-center">
              <span className="text-white/70 truncate">{s.email}</span>
              <span className="text-white/30 text-xs">{formatDate(s.timestamp)}</span>
            </div>
          </TableRow>
        ))}
      </div>
    );
  }

  function renderRSVPs() {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm">
        <div className="p-5 border-b border-white/[0.05]">
          <SectionHeader
            title="Tour RSVPs"
            count={rsvps.length}
            onExport={exportRSVPs}
          />
        </div>
        <TableHead>
          <div className="grid grid-cols-[1fr_120px] gap-4">
            <span>Email</span>
            <span>Date</span>
          </div>
        </TableHead>
        {rsvps.length === 0 && <EmptyState message="No tour RSVPs yet" />}
        {rsvps.map((r) => (
          <TableRow key={r.id}>
            <div className="grid grid-cols-[1fr_120px] gap-4 items-center">
              <span className="text-white/70 truncate">{r.email}</span>
              <span className="text-white/30 text-xs">{formatDate(r.timestamp)}</span>
            </div>
          </TableRow>
        ))}
      </div>
    );
  }

  function renderContacts() {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm">
        <div className="p-5 border-b border-white/[0.05]">
          <SectionHeader
            title="Business Inquiries"
            count={contacts.length}
            onExport={exportContacts}
          />
        </div>
        <TableHead>
          <div className="grid grid-cols-[1fr_140px_120px_24px] gap-3">
            <span>Name / Email</span>
            <span>Subject</span>
            <span>Date</span>
            <span />
          </div>
        </TableHead>
        {contacts.length === 0 && <EmptyState message="No inquiries yet" />}
        {contacts.map((c) => (
          <div key={c.id}>
            <TableRow
              onClick={() =>
                setExpandedContact(expandedContact === c.id ? null : c.id)
              }
              isExpanded={expandedContact === c.id}
            >
              <div className="grid grid-cols-[1fr_140px_120px_24px] gap-3 items-center">
                <div className="min-w-0">
                  <p className="text-white/80 text-sm truncate">{c.name}</p>
                  <p className="text-white/30 text-xs truncate">{c.email}</p>
                </div>
                <span className="text-brand-gold/70 text-xs">{c.subject}</span>
                <span className="text-white/30 text-xs">{formatDate(c.timestamp)}</span>
                {expandedContact === c.id ? (
                  <ChevronUp className="w-4 h-4 text-white/30" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/30" />
                )}
              </div>
            </TableRow>
            <AnimatePresence>
              {expandedContact === c.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 py-4 bg-white/[0.015] border-b border-white/[0.04]">
                    <p className="text-white/40 text-[10px] tracking-widest uppercase font-header mb-2">
                      Message
                    </p>
                    <p className="text-white/65 text-sm leading-relaxed">{c.message}</p>
                    <a
                      href={`mailto:${c.email}?subject=Re: ${c.subject}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-brand-gold/70 hover:text-brand-gold text-xs font-header tracking-wider uppercase transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="w-3 h-3" />
                      Reply via Email
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  }

  function renderSpotify() {
    const rel = spotify?.latestRelease;
    const sync = spotify?._sync;
    const coverImg = rel?.images?.[0]?.url;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          {/* Main Cinematic Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-[#0a0a0c] border border-white/[0.04] rounded-sm overflow-hidden min-h-[300px] flex flex-col justify-end p-8 isolate"
            style={{ borderTop: "1px solid rgba(255, 215, 0, 0.15)" }}
          >
            {/* Cinematic Background Layer */}
            {coverImg && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:opacity-40"
                  style={{ backgroundImage: `url(${coverImg})` }}
                />
                <div className="absolute inset-0 backdrop-blur-3xl bg-brand-dark/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
              </>
            )}

            <div className="relative z-10">
              <p className="font-header text-brand-gold drop-shadow-md text-[10px] tracking-[0.3em] uppercase mb-1">
                Live Data Feed
              </p>
              {rel ? (
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mt-4">
                  {coverImg && (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={coverImg}
                      alt={rel.name}
                      className="w-32 h-32 rounded-sm object-cover shrink-0 shadow-2xl border border-white/10"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-header text-white text-3xl sm:text-4xl uppercase tracking-tiight leading-none mb-2 text-shadow-sm">
                      {rel.name}
                    </h3>
                    <p className="text-white/60 text-sm font-medium tracking-wide">
                      {rel.artistName}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-white/30 text-xs font-header uppercase tracking-widest">
                      <span>{rel.type}</span>
                      <span className="w-1 h-1 rounded-full bg-brand-gold/50" />
                      <span>{rel.releaseDate}</span>
                    </div>

                    <a
                      href={rel.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-5 text-brand-gold/80 hover:text-brand-gold text-xs font-header tracking-[0.2em] uppercase transition-colors"
                    >
                      <Music2 className="w-4 h-4" />
                      Verify on Spotify
                    </a>
                  </div>
                </div>
              ) : (
                <EmptyState message="No Spotify data synced yet" />
              )}
            </div>
          </motion.div>

          {/* Sync Metadata Panel */}
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-sm p-6 backdrop-blur-md flex flex-col">
            <h4 className="font-header text-white/35 text-[10px] tracking-[0.2em] uppercase mb-6">
              System Status
            </h4>
            
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-white/20 text-[10px] tracking-widest font-header uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                  <p className="text-white/80 text-sm font-medium">Active Sync</p>
                </div>
              </div>

              {sync && (
                <>
                  <div>
                    <p className="text-white/20 text-[10px] tracking-widest font-header uppercase mb-1">Last Updated</p>
                    <p className="text-white/80 text-sm font-medium tracking-wide">{formatDate(sync.syncedAt)}</p>
                  </div>
                  <div>
                    <p className="text-white/20 text-[10px] tracking-widest font-header uppercase mb-1">Source Trigger</p>
                    <p className="text-brand-gold/70 text-xs font-mono">{sync.source}</p>
                  </div>
                </>
              )}
              
              {rel?.spotifyId && (
                <div>
                  <p className="text-white/20 text-[10px] tracking-widest font-header uppercase mb-1">Active Track ID</p>
                  <code className="font-mono text-white/50 text-xs block truncate bg-black/30 p-2 rounded border border-white/5">
                    {rel.spotifyId}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-brand-gold/[0.02] border border-brand-gold/[0.05] rounded-sm px-6 py-5 flex items-start gap-4">
          <div className="p-2 bg-brand-gold/10 rounded-full mt-0.5">
             <LayoutDashboard className="w-4 h-4 text-brand-gold/80" />
          </div>
          <p className="text-brand-gold/60 text-xs leading-relaxed max-w-3xl">
            <span className="font-header text-brand-gold/80 uppercase tracking-widest block mb-1">Manual Override Protocol</span>
            To instantly bypass the automated 24-hour sync cycle, locate the <strong className="text-white/60 font-mono">integrations/spotify</strong> document inside the Firebase Data Console and manually overwrite the <strong className="text-white/60 font-mono">spotifyId</strong> field. The global homepage player will inherit the new track universally across all connected client devices without requiring a full infrastructure rebuild.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-brand-dark flex overflow-hidden">
      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-60 bg-[#0a0a0c] border-r border-white/[0.05] z-30 flex flex-col lg:relative lg:translate-x-0 lg:animate-none"
      >
        {/* Branding */}
        <Link to="/" className="block">
          <motion.div
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            className="px-6 py-7 border-b border-white/[0.05] flex items-center justify-between group transition-colors relative"
            style={{ borderBottom: "1px solid rgba(255,215,0,0.08)" }}
            title="Return to Public Site"
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isLive
                      ? "bg-brand-gold animate-pulse"
                      : "bg-white/20"
                  }`}
                />
                <p className="font-header text-brand-gold text-[9px] tracking-[0.3em] uppercase">
                  RAPLOARD
                </p>
              </div>
              <p className="font-header text-white text-xl uppercase">The Vault</p>
              
              {/* Subtle hover tooltip integrated into flow */}
              <p className="absolute bottom-2 left-6 text-[8px] text-brand-gold/60 tracking-widest uppercase font-header opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Return to Surface →
              </p>
            </div>

            {/* Circular Image Logo */}
            <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               transition={{ type: "spring", stiffness: 400, damping: 17 }}
               className="shrink-0"
            >
              <img 
                src={CONFIG.assets.heroImage} 
                alt="Raploard" 
                className="w-10 h-10 rounded-full object-cover border border-brand-gold/30 shadow-[0_0_15px_rgba(255,215,0,0.1)] grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </motion.div>
          </motion.div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-150 font-header tracking-wider uppercase text-[11px] ${
                  isActive
                    ? "bg-brand-gold/10 text-brand-gold"
                    : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 border-t border-white/[0.05] pt-4">
          <button
            id="vault-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-white/25 hover:text-red-400/80 hover:bg-red-500/[0.06] text-[11px] font-header tracking-wider uppercase transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-brand-dark/90 backdrop-blur-sm border-b border-white/[0.05]">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex flex-col gap-1.5 p-1 mr-3"
            aria-label="Open menu"
          >
            <span className="w-5 h-px bg-white/40" />
            <span className="w-5 h-px bg-white/40" />
            <span className="w-5 h-px bg-white/40" />
          </button>

          <Link to="/" className="flex items-center gap-3 lg:hidden">
            <img 
              src={CONFIG.assets.heroImage} 
              alt="Raploard" 
              className="w-7 h-7 rounded-full object-cover border border-brand-gold/30 grayscale"
            />
            <p className="font-header text-white text-sm uppercase tracking-wider">The Vault</p>
          </Link>

          {/* Clock (desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <p className="font-header text-white/20 text-[10px] tracking-[0.2em]">
              {dateStr}
            </p>
            <p className="font-header text-brand-gold/50 text-[10px] tracking-[0.15em] tabular-nums">
              {clockStr}
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-auto">
            {isLive ? (
              <Wifi className="w-3.5 h-3.5 text-brand-gold/50" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-white/20" />
            )}
            <span
              className={`text-[9px] font-header tracking-widest uppercase ${
                isLive ? "text-brand-gold/50" : "text-white/20"
              }`}
            >
              {isLive ? "Live" : "Connecting"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && renderOverview()}
              {activeTab === "subscribers" && renderSubscribers()}
              {activeTab === "rsvps" && renderRSVPs()}
              {activeTab === "contacts" && renderContacts()}
              {activeTab === "spotify" && renderSpotify()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
