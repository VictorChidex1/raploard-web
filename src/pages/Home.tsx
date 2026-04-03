import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LatestRelease } from "../components/LatestRelease";
import { TourDates } from "../components/TourDates";
import { Hero } from "./Hero";
import { SonicVault } from "../components/SonicVault";
import { SonicManifesto } from "../components/SonicManifesto";
import { Helmet } from "react-helmet-async";
import { CONFIG } from "../config";

export function Home() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <Helmet>
        <title>{CONFIG.artist.name} | {CONFIG.artist.tagline}</title>
        <meta name="description" content={CONFIG.artist.metaDescription} />
        <meta property="og:title" content={`${CONFIG.artist.name} | ${CONFIG.artist.tagline}`} />
        <meta property="og:description" content={CONFIG.artist.metaDescription} />
        <meta property="og:image" content={CONFIG.assets.heroImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <Hero />
      <SonicVault />
      <LatestRelease />
      <SonicManifesto />
      <TourDates />
      <Footer />
    </div>
  );
}
