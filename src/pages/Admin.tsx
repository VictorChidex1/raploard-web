import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
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
    <div
      className="relative bg-white/[0.025] border border-white/[0.06] rounded-sm p-6 overflow-hidden"
      style={{ borderTop: "1px solid rgba(255, 215, 0, 0.15)" }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/[0.03] rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
      <p className="font-header text-white/35 text-[10px] tracking-[0.25em] uppercase mb-3">
        {label}
      </p>
      <p className="font-header text-white text-5xl tabular-nums">{count}</p>
      <p className="text-white/25 text-xs mt-2">{sublabel}</p>
    </div>
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
    <div
      onClick={onClick}
      className={`grid px-4 py-3.5 border-b border-white/[0.04] text-sm transition-colors duration-150 ${
        onClick
          ? "cursor-pointer hover:bg-white/[0.02]"
          : ""
      } ${isExpanded ? "bg-white/[0.02]" : ""}`}
    >
      {children}
    </div>
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
      <div className="space-y-4">
        <div
          className="bg-white/[0.025] border border-white/[0.06] rounded-sm p-6"
          style={{ borderTop: "1px solid rgba(255, 215, 0, 0.15)" }}
        >
          <p className="font-header text-white/35 text-[10px] tracking-[0.25em] uppercase mb-5">
            Current Sync Data
          </p>
          {rel ? (
            <div className="flex gap-5 items-start">
              {coverImg && (
                <img
                  src={coverImg}
                  alt={rel.name}
                  className="w-20 h-20 rounded-sm object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-header text-white text-2xl uppercase">{rel.name}</h3>
                <p className="text-white/40 text-sm capitalize">{rel.type} · {rel.releaseDate}</p>
                <p className="text-white/25 text-xs mt-1">Artist: {rel.artistName}</p>
                <p className="text-white/25 text-xs mt-0.5 font-mono break-all">
                  Track ID: {rel.spotifyId}
                </p>
                <a
                  href={rel.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-brand-gold/70 hover:text-brand-gold text-xs font-header tracking-wider uppercase transition-colors"
                >
                  <Music2 className="w-3 h-3" />
                  Open on Spotify
                </a>
              </div>
            </div>
          ) : (
            <EmptyState message="No Spotify data synced yet" />
          )}
        </div>

        {sync && (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm px-5 py-4">
            <p className="font-header text-white/35 text-[10px] tracking-[0.25em] uppercase mb-2">
              Sync Metadata
            </p>
            <p className="text-white/40 text-xs">
              Last synced: {formatDate(sync.syncedAt)}
            </p>
            <p className="text-white/25 text-xs mt-0.5">Source: {sync.source}</p>
          </div>
        )}

        <div className="bg-brand-gold/5 border border-brand-gold/15 rounded-sm px-5 py-4">
          <p className="text-brand-gold/60 text-xs leading-relaxed">
            <span className="font-header uppercase tracking-wider text-brand-gold/80">To update manually:</span>{" "}
            Go to Firebase Console → Firestore → integrations/spotify → edit the{" "}
            <code className="font-mono bg-white/5 px-1 rounded text-[10px]">latestRelease.spotifyId</code> field
            with the new track ID from Spotify. The player on the homepage updates instantly.
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
        <div
          className="px-6 py-7 border-b border-white/[0.05]"
          style={{ borderBottom: "1px solid rgba(255,215,0,0.08)" }}
        >
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
        </div>

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

          <div className="flex items-center gap-2 lg:hidden">
            <p className="font-header text-white text-sm uppercase tracking-wider">The Vault</p>
          </div>

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
