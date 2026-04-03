import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp, doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
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
  Loader2,
  Check,
  Link as LinkIcon,
  BookOpen,
  Trash2,
  Plus,
  PenTool
} from "lucide-react";
import { db, auth } from "../lib/firebase";
import { CONFIG } from "../config";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActiveTab = "overview" | "subscribers" | "rsvps" | "contacts" | "spotify" | "journal";

interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishDate: Timestamp;
}
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

// ─── Helper: Live Clock Component ──────────────────────────────────────────

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function LiveClockDisplay() {
  const clock = useLiveClock();
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

  return (
    <div className="hidden lg:flex items-center gap-4">
      <p className="font-header text-white/20 text-[10px] tracking-[0.2em]">
        {dateStr}
      </p>
      <p className="font-header text-brand-gold/50 text-[10px] tracking-[0.15em] tabular-nums">
        {clockStr}
      </p>
    </div>
  );
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
  { id: "journal", label: "Journal", Icon: BookOpen },
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
  onClick,
}: {
  label: string;
  value: number;
  sublabel: string;
  onClick?: () => void;
}) {
  const count = useAnimatedCounter(value);
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative bg-white/[0.015] border border-white/[0.04] rounded-sm p-6 overflow-hidden backdrop-blur-xl group ${onClick ? "cursor-pointer" : ""}`}
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

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [spotify, setSpotify] = useState<SpotifyDoc | null>(null);
  const [journal, setJournal] = useState<JournalArticle[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Journal CMS State
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [journalForm, setJournalForm] = useState({ id: "", title: "", slug: "", category: "Press", excerpt: "", content: "", coverImage: "", publishDateInput: "" });
  const [journalStatus, setJournalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Spotify Override State
  const [overrideUrl, setOverrideUrl] = useState("");
  const [overrideStatus, setOverrideStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSpotifyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideUrl) return;

    setOverrideStatus("loading");

    try {
      let spotifyId = "";
      let type = "single";

      if (overrideUrl.includes("track/")) {
        spotifyId = overrideUrl.split("track/")[1]?.split("?")[0] || "";
        type = "single";
      } else if (overrideUrl.includes("album/")) {
        spotifyId = overrideUrl.split("album/")[1]?.split("?")[0] || "";
        type = "album";
      } else {
        spotifyId = overrideUrl.trim();
      }

      if (!spotifyId || spotifyId.length < 10) {
        throw new Error("Invalid Spotify Track/Album URI");
      }

      await setDoc(
        doc(db, "integrations", "spotify"),
        {
          latestRelease: {
            spotifyId,
            type,
            artistName: "Raploard",
            name: "Manual Override",
            releaseDate: new Date().toISOString().split("T")[0],
            albumId: spotifyId,
            images: [{ url: "https://i.scdn.co/image/ab6761610000e5ebb50aab064c153ff29df3408a" }] // Optional generic fallback
          },
          _sync: {
            syncedAt: serverTimestamp(),
            source: "manual_override",
          },
        },
        { merge: true }
      );

      setOverrideStatus("success");
      setOverrideUrl("");
      setTimeout(() => setOverrideStatus("idle"), 3000);
    } catch (err) {
      console.error("Override failed:", err);
      setOverrideStatus("error");
      setTimeout(() => setOverrideStatus("idle"), 3000);
    }
  };

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

    const unsubJournal = onSnapshot(
      query(collection(db, "journal"), orderBy("publishDate", "desc")),
      (snap) => {
        setJournal(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as JournalArticle))
        );
      }
    );

    return () => {
      unsubNewsletter();
      unsubContacts();
      unsubSpotify();
      unsubJournal();
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



  // ─── Content sections ─────────────────────────────────────────────────

  function renderOverview() {
    return (
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Newsletter"
            value={newsletterSubs.length}
            sublabel="Total subscribers"
            onClick={() => setActiveTab("subscribers")}
          />
          <MetricCard
            label="Tour RSVPs"
            value={rsvps.length}
            sublabel="Live Circuit interest"
            onClick={() => setActiveTab("rsvps")}
          />
          <MetricCard
            label="Inquiries"
            value={contacts.length}
            sublabel="Contact form total"
            onClick={() => setActiveTab("contacts")}
          />
          <motion.div
            onClick={() => setActiveTab("spotify")}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer relative bg-white/[0.025] border border-white/[0.06] rounded-sm p-6 overflow-hidden hover:bg-white/[0.04] transition-colors"
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
          </motion.div>
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

        <div className="bg-white/[0.015] border border-white/[0.04] rounded-sm p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-gold/10 rounded-full">
               <LinkIcon className="w-4 h-4 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-header text-white text-sm uppercase tracking-widest">
                Manual Override Protocol
              </h4>
              <p className="text-white/40 text-xs mt-0.5 max-w-2xl">
                Paste a Spotify Track or Album URL below to immediately force the global homepage player to override. This bypasses the 24-hour cycle until the next automated system refresh.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSpotifyOverride} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={overrideUrl}
              onChange={(e) => setOverrideUrl(e.target.value)}
              placeholder={overrideStatus === "error" ? "Invalid Spotify URI. Try again." : "https://open.spotify.com/track/..."}
              disabled={overrideStatus === "loading" || overrideStatus === "success"}
              className="flex-1 bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={overrideStatus === "loading" || overrideStatus === "success"}
              className="bg-brand-gold text-black px-6 py-3 rounded-sm font-header text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
            >
              {overrideStatus === "idle" && "Override Now"}
              {overrideStatus === "loading" && <Loader2 className="w-4 h-4 animate-spin text-black" />}
              {overrideStatus === "success" && <Check className="w-4 h-4 text-black" />}
              {overrideStatus === "error" && "Failed"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  async function handleJournalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJournalStatus("loading");

    try {
      const isEditing = !!journalForm.id;
      const docRef = isEditing 
         ? doc(db, "journal", journalForm.id) 
         : doc(collection(db, "journal"));
      
      let finalPublishDate = serverTimestamp();
      if (journalForm.publishDateInput) {
         const dateObj = new Date(journalForm.publishDateInput + "T12:00:00");
         finalPublishDate = Timestamp.fromDate(dateObj);
      } else if (!isEditing) {
         finalPublishDate = serverTimestamp();
      }

      const payload = {
        title: journalForm.title,
        slug: journalForm.slug || journalForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        category: journalForm.category,
        excerpt: journalForm.excerpt,
        content: journalForm.content,
        coverImage: journalForm.coverImage,
        ...(isEditing && !journalForm.publishDateInput ? {} : { publishDate: finalPublishDate })
      };

      await setDoc(docRef, payload, { merge: true });

      setJournalStatus("success");
      setTimeout(() => {
        setJournalStatus("idle");
        setShowJournalEditor(false);
        setJournalForm({ id: "", title: "", slug: "", category: "Press", excerpt: "", content: "", coverImage: "", publishDateInput: "" });
      }, 1500);
    } catch (err) {
      console.error(err);
      setJournalStatus("error");
      setTimeout(() => setJournalStatus("idle"), 3000);
    }
  }

  async function handleJournalDelete(id: string) {
    if (confirm("Are you sure you want to delete this article? This is permanent.")) {
      await deleteDoc(doc(db, "journal", id));
    }
  }

  function renderJournal() {
    if (showJournalEditor) {
      return (
        <div className="space-y-6">
          <button 
             onClick={() => {
                setShowJournalEditor(false);
                setJournalForm({ id: "", title: "", slug: "", category: "Press", excerpt: "", content: "", coverImage: "", publishDateInput: "" });
             }}
             className="text-white/40 hover:text-white uppercase tracking-widest font-header text-xs mb-4 inline-block"
          >
            ← Back to Archive
          </button>
          
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-sm p-6 backdrop-blur-md max-w-4xl">
            <h3 className="font-header text-brand-gold text-lg uppercase tracking-widest mb-6">
              {journalForm.id ? "Edit Article" : "Draft New Article"}
            </h3>

            <form onSubmit={handleJournalSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Title</label>
                    <input 
                       required
                       type="text" 
                       value={journalForm.title}
                       onChange={(e) => {
                           const newTitle = e.target.value;
                           setJournalForm(prev => {
                               const newState = { ...prev, title: newTitle };
                               if (!prev.id) {
                                   newState.slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                               }
                               return newState;
                           });
                       }}
                       className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Slug (URL endpoint)</label>
                    <input 
                       type="text" 
                       value={journalForm.slug}
                       placeholder="leave blank to auto-generate"
                       onChange={(e) => setJournalForm({...journalForm, slug: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Category</label>
                    <select 
                       value={journalForm.category}
                       onChange={(e) => setJournalForm({...journalForm, category: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none"
                    >
                       <option>Press</option>
                       <option>Tour</option>
                       <option>Release</option>
                       <option>Editorial</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Publish Date</label>
                    <input 
                       required
                       type="date" 
                       value={journalForm.publishDateInput}
                       onChange={(e) => setJournalForm({...journalForm, publishDateInput: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none [color-scheme:dark]"
                    />
                 </div>
                 <div>
                    <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Cover Image URL</label>
                    <input 
                       required
                       type="text" 
                       value={journalForm.coverImage}
                       placeholder="https://..."
                       onChange={(e) => setJournalForm({...journalForm, coverImage: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none"
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Excerpt (Short Summary)</label>
                 <textarea 
                    required
                    value={journalForm.excerpt}
                    rows={2}
                    onChange={(e) => setJournalForm({...journalForm, excerpt: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none"
                 />
               </div>

               <div>
                 <label className="block text-white/40 text-[10px] uppercase font-header tracking-widest mb-2">Article Body Content (Hit Enter for Paragraphs)</label>
                 <textarea 
                    required
                    value={journalForm.content}
                    rows={12}
                    onChange={(e) => {
                        const newContent = e.target.value;
                        setJournalForm(prev => {
                            const newState = { ...prev, content: newContent };
                            if (!prev.id) {
                                const cleanText = newContent.replace(/\n/g, " ").trim();
                                newState.excerpt = cleanText.substring(0, 150) + (cleanText.length > 150 ? "..." : "");
                            }
                            return newState;
                        });
                    }}
                    className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-sm text-sm text-white focus:border-brand-gold/50 focus:outline-none placeholder:text-white/20"
                    placeholder="Write your article here. Empty spaces and paragraphs are fully preserved and will render dynamically."
                 />
               </div>

               <button
                  type="submit"
                  disabled={journalStatus === "loading" || journalStatus === "success"}
                  className="bg-brand-gold text-black px-6 py-4 rounded-sm font-header text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center min-w-[200px]"
               >
                 {journalStatus === "idle" && (journalForm.id ? "Update Post" : "Publish Post")}
                 {journalStatus === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                 {journalStatus === "success" && <Check className="w-4 h-4" />}
                 {journalStatus === "error" && "Error"}
               </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <SectionHeader title="The Publishing Desk" count={journal.length} onExport={() => {}} />

        <div className="bg-white/[0.015] border border-white/[0.04] rounded-sm backdrop-blur-md">
           <div className="p-4 border-b border-white/10 flex justify-end">
              <button 
                 onClick={() => {
                    setJournalForm({ id: "", title: "", slug: "", category: "Press", excerpt: "", content: "", coverImage: "", publishDateInput: new Date().toISOString().split("T")[0] });
                    setShowJournalEditor(true);
                 }}
                 className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-4 py-2 rounded-sm text-[10px] uppercase font-header tracking-widest hover:bg-brand-gold hover:text-black transition-colors"
              >
                 <Plus className="w-3 h-3" /> New Post
              </button>
           </div>
           
           <div className="divide-y divide-white/5">
              {journal.map(post => (
                 <div key={post.id} className="p-4 flex items-center gap-6 group hover:bg-white/[0.02]">
                    <img src={post.coverImage} className="w-24 h-24 object-cover object-center rounded-sm grayscale group-hover:grayscale-0 transition-all border border-white/10" />
                    <div className="flex-1">
                       <span className="font-header text-brand-gold text-[10px] tracking-widest uppercase mb-1 block">{post.category}</span>
                       <h4 className="font-serif text-2xl text-white mb-2">{post.title}</h4>
                       <p className="text-sm text-white/40 max-w-xl truncate">{post.excerpt}</p>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => { 
                          let inlineDate = "";
                          if (post.publishDate?.toDate) {
                             inlineDate = post.publishDate.toDate().toISOString().split("T")[0];
                          }
                          setJournalForm({ ...post, publishDateInput: inlineDate }); 
                          setShowJournalEditor(true); 
                       }} className="flex items-center justify-center gap-2 text-[10px] uppercase font-header tracking-widest px-3 py-2 bg-white/5 border border-white/10 text-white hover:text-brand-gold rounded-sm w-full">
                          <PenTool className="w-3 h-3" /> Edit
                       </button>
                       <button onClick={() => handleJournalDelete(post.id)} className="flex items-center justify-center gap-2 text-[10px] uppercase font-header tracking-widest px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-sm transition-colors w-full">
                          <Trash2 className="w-3 h-3" /> Delete
                       </button>
                    </div>
                 </div>
              ))}

              {journal.length === 0 && (
                 <div className="p-12 text-center text-white/30 uppercase tracking-widest text-[10px] font-header">
                    No articles found in archive.
                 </div>
              )}
           </div>
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
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#0a0a0c] border-r border-white/[0.05] z-30 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
      </aside>

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
          <LiveClockDisplay />

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
              {activeTab === "journal" && renderJournal()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
