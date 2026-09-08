'use client';

import { useState, useEffect } from 'react';
import { lokasiService } from '../lib/services/lokasi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const INITIAL_COUNT = 3;

export default function LocationSection() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { loadLocations(); }, []);

  const loadLocations = async () => {
    try {
      const data = await lokasiService.getAllLokasi();
      const lokasi = Array.isArray(data) ? data : (data.data || []);
      const withPublishedTour = lokasi.filter(l => l.virtual_tour?.image_path && l.virtual_tour?.status_id === 3);
      setLocations(withPublishedTour);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (loc) => {
    const path = loc.virtual_tour?.image_path;
    if (!path) return '/CandiKR.jpg';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const displayed = showAll ? locations : locations.slice(0, INITIAL_COUNT);
  const hasMore = locations.length > INITIAL_COUNT;

  return (
    <div id="lokasi" className="w-full bg-[#F2E4DB]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h2 className="text-2xl font-bold text-[#6C584C] mb-2">Lokasi</h2>
        <div className="h-[5px] w-[250px] rounded-full mb-7"
          style={{ background: "linear-gradient(to right, #6C584C 0 80px, #6C584C66 80px 300px)" }} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Memuat lokasi...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayed.map((loc, index) => (
                <div
                  key={loc.id || index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/virtual-tour?tour_id=${loc.virtual_tour?.id}`}
                >
                  <img
                    src={getImageUrl(loc)}
                    alt={loc.nama}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.src = '/CandiKR.jpg'; }}
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-xl text-[#6C584C]">{loc.nama}</h3>
                    <p className="text-gray-600 text-sm mt-2">Klik untuk melihat virtual tour 360°</p>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#6C584C] hover:bg-[#5a4a3e] text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {showAll ? (
                    <>
                      <span>Tampilkan Lebih Sedikit</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Lihat Semua Lokasi ({locations.length})</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
