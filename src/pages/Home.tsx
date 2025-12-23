import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LatestRelease } from "../components/LatestRelease";
import { TourDates } from "../components/TourDates";
import { Hero } from "./Hero";
import { SonicVault } from "../components/SonicVault";

export function Home() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />
      <Hero />
      <SonicVault />
      <LatestRelease />
      <TourDates />
      <Footer />
    </div>
  );
}
