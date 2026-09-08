'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { lokasiService } from '../lib/services/lokasi';
import { getUserFromCookies } from '../lib/utils/auth';
import { rencanaKunjunganService } from '../lib/services/rencanaKunjungan';

// Data statis koordinat peta — id harus sama dengan id lokasi di database
const STATIC_LOCATIONS = [
  { id: 1, name: 'Gate Kebun Raya', gate: 'Gate 1', x: 24.98, y: 73.75 },
  { id: 2, name: 'Patung Rama Sinta', gate: 'Gate 5', x: 32.1, y: 58.47 },
  { id: 3, name: 'Patung Kumbakarna', gate: 'Gate 7', x: 33.98, y: 40.51 },
  { id: 4, name: 'Taman Mawar', gate: 'Gate 31', x: 41.32, y: 44.51 },
  { id: 5, name: 'Taman Rhododendron', gate: 'Gate 12', x: 41.09, y: 34.11 },
  { id: 6, name: 'Taman Cyathea', gate: 'Gate 13', x: 47.35, y: 36.07 },
  { id: 7, name: 'Taman Anggrek', gate: 'Gate 15', x: 45.82, y: 24.73 },
  { id: 8, name: 'Rumah Kaca Kaktus', gate: 'Gate 16', x: 38.53, y: 24.15 },
  { id: 9, name: 'Taman Akuatik', gate: 'Gate 17', x: 41.89, y: 16.15 },
  { id: 10, name: 'Taman Usada', gate: 'Gate 18', x: 49.12, y: 22.69 },
  { id: 12, name: 'Taman Bambu', gate: 'Gate 26', x: 52.93, y: 40.58 },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function getThumbnailUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

export default function InteractiveMap({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [locations, setLocations] = useState(STATIC_LOCATIONS);
  const [loading, setLoading] = useState(true);
  const [rencana, setRencana] = useState([]);
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loadingRencana, setLoadingRencana] = useState(false);

  const fetchRencana = useCallback(async () => {
    try {
      setLoadingRencana(true);
      const res = await rencanaKunjunganService.getDraft();
      const draft = res.data;
      const list = draft ? (typeof draft.lokasi_list === 'string' ? JSON.parse(draft.lokasi_list) : (draft.lokasi_list || [])) : [];
      setRencana(list);
    } catch {
      /* ignore */
    } finally {
      setLoadingRencana(false);
    }
  }, []);

  useEffect(() => {
    const u = getUserFromCookies();
    setUser(u);
    if (u) fetchRencana();
  }, [fetchRencana]);

  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const dbLokasi = await lokasiService.getLokasiForMap();
        if (dbLokasi.length > 0) {
          const merged = dbLokasi.map((db) => {
            const staticLoc = STATIC_LOCATIONS.find((s) => s.id === db.id);
            const vt = db.virtual_tour;
            const vtPublished = vt?.status_id === 3;
            return {
              id: db.id,
              name: db.nama,
              gate: db.gate_number || staticLoc?.gate || '',
              x: db.map_x ?? staticLoc?.x ?? 50,
              y: db.map_y ?? staticLoc?.y ?? 50,
              deskripsi: db.deskripsi,
              thumbnail: getThumbnailUrl(db.thumbnail),
              virtualTour: vtPublished ? vt : null,
              hasData: vtPublished,
            };
          });
          setLocations(merged);
        }
      } catch {
        // Gagal fetch, tetap pakai data statis
      } finally {
        setLoading(false);
      }
    };
    fetchLokasi();
  }, []);

  const handleMarkerClick = (loc) => {
    setSelected(selected?.id === loc.id ? null : loc);
  };

  const toggleRencana = async (loc) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const sudahAda = rencana.some((l) => l.lokasiId === loc.id);

    if (sudahAda) {
      try {
        await rencanaKunjunganService.removeLokasi(loc.id);
        await fetchRencana();
      } catch {
        alert('Gagal menghapus dari rencana kunjungan');
      }
    } else {
      try {
        await rencanaKunjunganService.addLokasi({
          lokasiId: loc.id,
          name: loc.name,
          gate: loc.gate,
          deskripsi: loc.deskripsi || '',
          thumbnail: loc.thumbnail || null,
          virtualTourId: loc.virtualTour?.id || null,
          x: loc.x,
          y: loc.y,
        });
        await fetchRencana();
      } catch {
        alert('Gagal menambahkan ke rencana kunjungan');
      }
    }
  };

  const handleOpenPlan = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    window.location.href = '/favorit';
  };

  const isInRencana = (id) => rencana.some((r) => r.lokasiId === id);
  const rencanaLokasi = rencana.filter((v, i, a) => a.findIndex(t => t.lokasiId === v.lokasiId) === i);

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/70 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-green-700 px-5 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base">Peta Interaktif Kebun Raya Eka Karya Bali</h2>
              <p className="text-green-200 text-xs mt-0.5">Klik marker untuk melihat informasi lokasi</p>
            </div>
            <div className="flex items-center gap-3">
              {rencanaLokasi.length > 0 && (
                <button onClick={handleOpenPlan} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-green-900 text-xs font-bold rounded-lg transition-colors">
                  Lihat Rencana ({rencanaLokasi.length})
                </button>
              )}
              <button onClick={onClose} className="text-white hover:text-green-200 transition-colors" aria-label="Tutup peta">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Map Area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="relative flex-1 overflow-auto">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="relative w-full" style={{ aspectRatio: '1757/1375' }}>
                <Image src="/peta-kebun-raya-bali.jpg" alt="Peta Kebun Raya Eka Karya Bali" fill className="object-contain" priority />

                {/* Markers */}
                {locations.map((loc, index) => (
                  <button key={loc.id} onClick={() => handleMarkerClick(loc)} style={{ left: `${loc.x}%`, top: `${loc.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 group" aria-label={`Lokasi ${loc.name}`}>
                    <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${isInRencana(loc.id) ? 'bg-orange-400' : selected?.id === loc.id ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <span
                      className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-lg text-white text-xs font-bold transition-all ${
                        isInRencana(loc.id)
                          ? 'bg-orange-500 scale-110'
                          : selected?.id === loc.id
                            ? 'bg-yellow-500 scale-125'
                            : loc.hasData
                              ? 'bg-green-600 hover:bg-green-500 hover:scale-110'
                              : 'bg-gray-400 hover:bg-gray-500 hover:scale-110'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {loc.gate} — {loc.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Info */}
            {selected && (
              <div className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
                <div className="bg-green-700 px-4 py-3">
                  <p className="text-green-200 text-xs">{selected.gate}</p>
                  <h3 className="text-white font-bold text-sm">{selected.name}</h3>
                </div>

                <div className="p-4 flex-1">
                  {selected.hasData ? (
                    <div className="space-y-3">
                      {selected.deskripsi && <p className="text-sm text-gray-600">{selected.deskripsi}</p>}

                      {/* Tombol tambah ke rencana */}
                      <button
                        onClick={() => toggleRencana(selected)}
                        className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors group/btn ${
                          isInRencana(selected.id) ? 'bg-orange-100 text-orange-700 hover:bg-red-100 hover:text-red-700 hover:border-red-300 border border-orange-300' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isInRencana(selected.id) ? (
                          <span>
                            <span className="group-hover/btn:hidden">✓ Ditambahkan ke Rencana</span>
                            <span className="hidden group-hover/btn:inline">✕ Batalkan dari Rencana</span>
                          </span>
                        ) : (
                          '+ Tambah ke Rencana Kunjungan'
                        )}
                      </button>

                      {/* Info VR */}
                      {selected.virtualTour && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-green-700">🌐 {selected.virtualTour.nama}</p>
                          {selected.virtualTour.deskripsi && <p className="text-xs text-gray-500 line-clamp-3">{selected.virtualTour.deskripsi}</p>}
                          {selected.virtualTour.status_id === 3 ? (
                            <a href={`/virtual-tour?tour_id=${selected.virtualTour.id}`} className="block w-full text-center py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                              ▶ Mulai Virtual Tour
                            </a>
                          ) : (
                            <p className="text-xs text-yellow-600 text-center">⏳ VR sedang menunggu persetujuan</p>
                          )}
                        </div>
                      )}
                      {!selected.virtualTour && <p className="text-xs text-gray-400 text-center">Virtual tour belum tersedia</p>}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500">Informasi Belum Tersedia</p>
                      <p className="text-xs text-gray-400 mt-1">Data lokasi sedang dalam proses pengisian</p>

                      {/* Tetap bisa tambah ke rencana meski belum ada data */}
                      <button
                        onClick={() => toggleRencana(selected)}
                        className={`mt-3 w-full py-2 text-xs font-semibold rounded-lg transition-colors group/btn ${
                          isInRencana(selected.id) ? 'bg-orange-100 text-orange-700 hover:bg-red-100 hover:text-red-700 hover:border-red-300 border border-orange-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {isInRencana(selected.id) ? (
                          <span>
                            <span className="group-hover/btn:hidden">✓ Ditambahkan ke Rencana</span>
                            <span className="hidden group-hover/btn:inline">✕ Batalkan dari Rencana</span>
                          </span>
                        ) : (
                          '+ Tambah ke Rencana'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => setSelected(null)} className="m-4 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-all">
                  Tutup Info
                </button>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-5 py-2 border-t border-gray-100 bg-white flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              Data tersedia
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
              Belum ada data
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
              Dipilih
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              Di rencana
            </div>
            <p className="ml-auto">Total {locations.length} lokasi</p>
          </div>
        </div>
      </div>



      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Login Diperlukan</h3>
            <p className="text-sm text-gray-500 mb-5">Anda harus login terlebih dahulu untuk membuat rencana kunjungan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLoginPrompt(false)} className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                Batal
              </button>
              <a href="/login" className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors text-center">
                Login Sekarang
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
