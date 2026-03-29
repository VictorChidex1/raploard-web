/**
 * SpotifyPlayer
 *
 * Reads the `integrations/spotify` Firestore document in real-time using
 * onSnapshot. When the Cloud Function updates this doc every 24 hours,
 * this component automatically re-renders with the new release — zero
 * code deploys required.
 *
 * States:
 *   loading → animated skeleton (brand-styled, no layout shift)
 *   ready   → Spotify dark-theme embedded iframe
 *   empty   → renders nothing (graceful — no broken UI)
 */

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

// Shape of the Firestore doc at integrations/spotify
interface SpotifyDoc {
  latestRelease: {
    spotifyId: string;
    name: string;
    type: string; // "album" | "single" | "compilation"
    artistName: string;
    releaseDate: string;
  };
}

type PlayerStatus = "loading" | "ready" | "empty";

export function SpotifyPlayer() {
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>("");

  useEffect(() => {
    // Real-time listener — automatically fires whenever the Cloud Function
    // updates the document, keeping the embed always current.
    const unsubscribe = onSnapshot(
      doc(db, "integrations", "spotify"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SpotifyDoc;
          const release = data.latestRelease;

          if (release?.spotifyId) {
            setSpotifyId(release.spotifyId);
            setTrackName(release.name ?? "");
            setStatus("ready");
          } else {
            setStatus("empty");
          }
        } else {
          // Document doesn't exist yet — Cloud Function hasn't run once yet.
          // Render nothing cleanly rather than breaking the layout.
          setStatus("empty");
        }
      },
      (error) => {
        // Firestore read error — log it but never crash the UI
        console.error("[SpotifyPlayer] Firestore listener error:", error);
        setStatus("empty");
      }
    );

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Graceful empty state — no broken iframe, no error box
  if (status === "empty") return null;

  // Loading skeleton — matches the iframe dimensions to prevent layout shift
  if (status === "loading") {
    return (
      <div className="w-full mt-6 space-y-2">
        <div className="h-[1px] bg-gradient-to-r from-brand-gold/30 via-brand-gold/10 to-transparent mb-4" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600">
            Loading latest release…
          </span>
        </div>
        {/* Skeleton pulses at exactly the iframe height to prevent layout shift */}
        <div className="w-full h-[152px] bg-white/[0.03] border border-white/5 rounded-sm animate-pulse" />
      </div>
    );
  }

  // Track IDs must use /embed/track/ — using /embed/album/ with a track ID
  // returns Spotify's "Page not found" error. The Cloud Function stores track
  // IDs (from the album's first track), so this URL format is always correct.
  const embedUrl = `https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`;

  return (
    <div className="w-full mt-6">
      {/* Gold hairline divider above the player */}
      <div className="h-[1px] bg-gradient-to-r from-brand-gold/40 via-brand-gold/10 to-transparent mb-4" />

      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
          Now Streaming — {trackName}
        </span>
      </div>

      {/* Spotify embed — dark theme (theme=0) to match the brand */}
      <div className="overflow-hidden rounded-sm border border-white/5 hover:border-brand-gold/20 transition-colors duration-500">
        <iframe
          src={embedUrl}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Listen to ${trackName} on Spotify`}
          style={{ border: "none", display: "block" }}
        />
      </div>
    </div>
  );
}
