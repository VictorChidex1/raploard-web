/**
 * Raploard — Firebase Cloud Functions
 *
 * Function: syncLatestSpotifyRelease
 * Trigger:  Pub/Sub Schedule — runs every 24 hours
 * Purpose:  Fetches Raploard's latest release from the Spotify Web API
 *           using the Client Credentials flow, then writes the result
 *           to Firestore at `integrations/spotify`.
 */

import { setGlobalOptions } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// ---------------------------------------------------------------------------
// SEO Engine — Universal Interceptor
// ---------------------------------------------------------------------------
// This function handles the dynamic SEO for all routes (Home, Music, etc.)
// and ensures and premium previews for social media.
export { seoInterceptor } from "./seo";

// ---------------------------------------------------------------------------
// Initialise Firebase Admin SDK
// ---------------------------------------------------------------------------
admin.initializeApp();

const db = admin.firestore();

// Cap the maximum number of concurrent containers globally.
setGlobalOptions({ maxInstances: 10 });

// ---------------------------------------------------------------------------
// Spotify API — TypeScript interfaces
// ---------------------------------------------------------------------------

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string; // "album" | "single" | "compilation"
  release_date: string; // "YYYY-MM-DD"
  total_tracks: number;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  artists: Array<{ id: string; name: string }>;
}

interface SpotifyAlbumsResponse {
  items: SpotifyAlbum[];
  total: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  track_number: number;
  duration_ms: number;
  external_urls: { spotify: string };
}

interface SpotifyTracksResponse {
  items: SpotifyTrack[];
  total: number;
}

// ---------------------------------------------------------------------------
// Helper: getSpotifyAccessToken
// ---------------------------------------------------------------------------

/**
 * Authenticates with the Spotify Web API using the Client Credentials flow.
 *
 * This flow authenticates the *application* (not a user) and is appropriate
 * for reading public Spotify catalogue data like artist albums and tracks.
 * Credentials are read from process.env, which is populated from:
 *   - functions/.env  → when running on the local Firebase Emulator
 *   - Firebase Secret Manager → in production (set with: firebase functions:secrets:set)
 */
async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Spotify credentials. " +
        "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in functions/.env (local) " +
        "or via Firebase Secret Manager (production)."
    );
  }

  // Spotify requires credentials as Base64-encoded "clientId:clientSecret"
  // in the Authorization header of the token request.
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Spotify token request failed [${response.status}]: ${errText}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Helper: fetchLatestRelease
// ---------------------------------------------------------------------------

/**
 * Fetches the most recently released single or album for the given Spotify
 * artist ID.
 *
 * We request include_groups=single,album to exclude compilations and
 * "appears_on" credits — so we only get Raploard's own releases.
 * The Spotify API returns results sorted newest-first; we take item[0].
 */
async function fetchLatestRelease(
  artistId: string,
  accessToken: string
): Promise<SpotifyAlbum> {
  const url = new URL(`https://api.spotify.com/v1/artists/${artistId}/albums`);
  url.searchParams.set("include_groups", "single,album");
  url.searchParams.set("market", "NG"); 
  url.searchParams.set("limit", "1"); 
  url.searchParams.set("offset", "0");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Spotify albums fetch failed [${response.status}]: ${errText}`);
  }

  const data = (await response.json()) as SpotifyAlbumsResponse;

  if (!data.items || data.items.length === 0) {
    throw new Error(`No releases found on Spotify for artist ID: ${artistId}`);
  }

  return data.items[0];
}

// ---------------------------------------------------------------------------
// Helper: fetchFirstTrackId
// ---------------------------------------------------------------------------

/**
 * Fetches the tracks of a Spotify album/single and returns the first track's
 * Spotify ID.
 *
 * This is necessary because the Spotify embed system requires TRACK IDs for
 * /embed/track/ URLs. The albums endpoint gives us ALBUM IDs, which only
 * work with /embed/album/ — but /embed/track/ gives a better single-song UX.
 * For singles (1-track releases), the first track IS the song we want.
 */
async function fetchFirstTrackId(
  albumId: string,
  accessToken: string
): Promise<string | null> {
  const url = new URL(`https://api.spotify.com/v1/albums/${albumId}/tracks`);
  url.searchParams.set("limit", "1");
  url.searchParams.set("market", "NG");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    logger.warn(
      `[Spotify Sync] Could not fetch tracks for album ${albumId} [${response.status}]. Will fall back to album ID.`
    );
    return null;
  }

  const data = (await response.json()) as SpotifyTracksResponse;
  return data.items?.[0]?.id ?? null;
}

// ---------------------------------------------------------------------------
// Scheduled Cloud Function: syncLatestSpotifyRelease
// ---------------------------------------------------------------------------

/**
 * Runs automatically every 24 hours via Google Cloud Pub/Sub Scheduler.
 *
 * Flow:
 *   1. Read SPOTIFY_ARTIST_ID from env
 *   2. Acquire a Spotify access token (Client Credentials)
 *   3. Fetch the artist's latest single or album
 *   4. Write the result to Firestore → integrations/spotify
 *
 * The Firestore write uses { merge: true } to preserve any manually-added
 * fields in that document between syncs.
 *
 * Error handling: each step is wrapped independently so a failure in one
 * step emits a structured log and exits cleanly — no unhandled rejections.
 */
export const syncLatestSpotifyRelease = onSchedule(
  {
    schedule: "every 24 hours",
    timeZone: "Africa/Lagos", 
    retryCount: 3, 
    memory: "256MiB", 
    timeoutSeconds: 60,
  },
  async (_event) => {
    // ── Step 1: Validate required env vars ──────────────────────────────────
    const artistId = process.env.SPOTIFY_ARTIST_ID;

    if (!artistId) {
      logger.error(
        "[Spotify Sync] SPOTIFY_ARTIST_ID is not set. " +
          "Add it to functions/.env (local) or Firebase Secret Manager (prod). Aborting."
      );
      return;
    }

    logger.info(`[Spotify Sync] Starting sync for artist ID: ${artistId}`);

    // ── Step 2: Authenticate with Spotify ───────────────────────────────────
    let accessToken: string;
    try {
      accessToken = await getSpotifyAccessToken();
      logger.info("[Spotify Sync] Spotify access token acquired.");
    } catch (err) {
      logger.error("[Spotify Sync] Failed to acquire Spotify access token.", err);
      return;
    }

    // ── Step 3: Fetch the latest release ────────────────────────────────────
    let latestRelease: SpotifyAlbum;
    try {
      latestRelease = await fetchLatestRelease(artistId, accessToken);
      logger.info(
        `[Spotify Sync] Latest release: "${latestRelease.name}" ` +
          `(${latestRelease.album_type}) — released ${latestRelease.release_date}`
      );
    } catch (err) {
      logger.error("[Spotify Sync] Failed to fetch latest release from Spotify.", err);
      return;
    }

    // ── Step 4: Fetch the first track ID for embedding ──────────────────────
    // The Spotify embed player needs a TRACK ID (/embed/track/{id}), not an
    // album ID. Singles have exactly one track — fetch and store its ID.
    let embedTrackId: string = latestRelease.id; // fallback: album ID

    try {
      const trackId = await fetchFirstTrackId(latestRelease.id, accessToken);
      if (trackId) {
        embedTrackId = trackId;
        logger.info(`[Spotify Sync] First track ID fetched: ${embedTrackId}`);
      }
    } catch (err) {
      logger.warn("[Spotify Sync] Could not fetch first track ID. Falling back to album ID.", err);
    }

    // ── Step 5: Write to Firestore ───────────────────────────────────────────
    // Stored at: integrations/spotify
    // The front-end reads this to power the embedded Spotify player.
    const payload = {
      latestRelease: {
        // spotifyId stores the TRACK ID for use with /embed/track/ in SpotifyPlayer
        spotifyId: embedTrackId,
        albumId: latestRelease.id,   // preserved for reference
        name: latestRelease.name,
        type: latestRelease.album_type,
        releaseDate: latestRelease.release_date,
        totalTracks: latestRelease.total_tracks,
        // All image sizes (640px, 300px, 64px) — let the front-end choose
        images: latestRelease.images.map((img) => ({
          url: img.url,
          width: img.width,
          height: img.height,
        })),
        spotifyUrl: latestRelease.external_urls.spotify,
        artistName: latestRelease.artists[0]?.name ?? "Raploard",
      },
      // Sync metadata — useful for debugging stale data
      _sync: {
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: "spotify-scheduled-sync",
        artistId,
      },
    };

    try {
      // merge: true preserves any existing fields not in our payload
      await db.doc("integrations/spotify").set(payload, { merge: true });
      logger.info(
        "[Spotify Sync] Firestore doc `integrations/spotify` updated successfully."
      );
    } catch (err) {
      logger.error("[Spotify Sync] Failed to write to Firestore.", err);
    }
  }
);
