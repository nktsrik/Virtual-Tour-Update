'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LocationSection from "@/components/LocationSection";
import GaleriPreview from "@/components/GaleriPreview";
import YoutubeSection from "@/components/YoutubeSection";
import HubungiKamiSection from "@/components/HubungiKamiSection";
import InteractiveMap from "@/components/InteractiveMap";

export default function Home() {
  const [showMap, setShowMap] = useState(false);

  return (
    <main>
      <Navbar />
      <HeroSection />
      <LocationSection />
      <GaleriPreview />
      <YoutubeSection />
      <HubungiKamiSection />

      {/* Tombol Peta Interaktif */}
      <div className="fixed bottom-6 left-6 z-[9997]">
        <button
          onClick={() => setShowMap(true)}
          className="w-14 h-14 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Buka Peta Lokasi"
          aria-label="Buka peta interaktif"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
          </svg>
        </button>
        <p className="text-center text-xs text-white bg-green-700 rounded-full mt-1 px-2 py-0.5 shadow">Peta</p>
      </div>

      {/* Modal Peta Interaktif */}
      {showMap && <InteractiveMap onClose={() => setShowMap(false)} />}
    </main>
  );
}
