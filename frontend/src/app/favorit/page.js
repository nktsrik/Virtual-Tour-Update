'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getUserFromCookies } from '../../../lib/utils/auth';
import { rencanaKunjunganService } from '../../../lib/services/rencanaKunjungan';
import { koleksiService } from '../../../lib/services/koleksi';
import VisitPlanModal from '../../../components/VisitPlanModal';

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTanggalPendek(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RencanaPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('draft'); // 'draft' | 'riwayat'
  const [rencana, setRencana] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchDraft = useCallback(async () => {
    try {
      setLoading(true);
      const [res, lokasiRes] = await Promise.allSettled([
        rencanaKunjunganService.getDraft(),
        koleksiService.getAllKoleksi(),
      ]);

      const koordinatMap = {};
      if (lokasiRes.status === 'fulfilled') {
        const lokasiData = Array.isArray(lokasiRes.value) ? lokasiRes.value : (lokasiRes.value?.data || []);
        lokasiData.forEach((l) => {
          if (l.map_x && l.map_y) koordinatMap[l.id] = { x: parseFloat(l.map_x), y: parseFloat(l.map_y) };
        });
      }

      const draft = res.status === 'fulfilled' ? res.value?.data : null;
      const list = draft ? (typeof draft.lokasi_list === 'string' ? JSON.parse(draft.lokasi_list) : (draft.lokasi_list || [])) : [];
      const listWithCoord = list.map((item) => ({
        ...item,
        x: koordinatMap[item.lokasiId]?.x ?? item.x ?? null,
        y: koordinatMap[item.lokasiId]?.y ?? item.y ?? null,
      }));

      setRencana(listWithCoord);
    } catch {
      setError('Gagal memuat rencana kunjungan');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRiwayat = useCallback(async () => {
    try {
      setLoadingRiwayat(true);
      const res = await rencanaKunjunganService.getAll();
      const data = Array.isArray(res) ? res : (res?.data || []);
      // Filter hanya yang sudah punya tanggal (bukan draft)
      const tersimpan = data.filter((r) => r.tanggal !== null);
      setRiwayat(tersimpan);
    } catch {
      setError('Gagal memuat riwayat');
    } finally {
      setLoadingRiwayat(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getUserFromCookies();
    setUser(currentUser);
    if (currentUser) fetchDraft();
    else setLoading(false);
  }, [fetchDraft]);

  useEffect(() => {
    if (user && tab === 'riwayat') fetchRiwayat();
  }, [user, tab, fetchRiwayat]);

  const handleRemoveDraft = async (lokasiId) => {
    try {
      await rencanaKunjunganService.removeLokasi(lokasiId);
      setRencana((prev) => prev.filter((r) => r.lokasiId !== lokasiId));
    } catch {
      setError('Gagal menghapus lokasi');
    }
  };

  const handleHapusRiwayat = async (id) => {
    if (!confirm('Hapus rencana ini?')) return;
    try {
      await rencanaKunjunganService.hapus(id);
      setRiwayat((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Gagal menghapus riwayat');
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Silakan Login</h1>
            <p className="text-gray-500 text-sm mb-6">Anda harus login untuk melihat rencana kunjungan</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">Login</Link>
              <Link href="/" className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">Kembali</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-800">Rencana Kunjungan</h1>
            {tab === 'draft' && rencana.length > 0 && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Generate Rencana
              </button>
            )}
          </div>

          {/* Tab */}
          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setTab('draft')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'draft' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Lokasi Dipilih
              {rencana.length > 0 && (
                <span className="ml-1.5 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{rencana.length}</span>
              )}
            </button>
            <button
              onClick={() => setTab('riwayat')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'riwayat' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Riwayat Tersimpan
              {riwayat.length > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{riwayat.length}</span>
              )}
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

          {/* Tab: Lokasi Dipilih (Draft) */}
          {tab === 'draft' && (
            loading ? (
              <div className="flex justify-center py-20">
                <svg className="animate-spin h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : rencana.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-700 mb-1">Belum Ada Lokasi</h2>
                <p className="text-gray-400 text-sm mb-5">Tambahkan lokasi dari Peta Interaktif</p>
                <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Buka Peta
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {rencana.map((loc) => (
                    <div key={loc.lokasiId} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-green-50 flex-shrink-0">
                        {loc.thumbnail ? (
                          <img src={loc.thumbnail} alt={loc.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{loc.name}</p>
                        {loc.gate && <p className="text-xs text-gray-400 mt-0.5">{loc.gate}</p>}
                      </div>
                      {loc.virtualTourId && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">360°</span>}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {loc.virtualTourId && (
                          <Link href={`/virtual-tour?tour_id=${loc.virtualTourId}`} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors">
                            Lihat Tour
                          </Link>
                        )}
                        <button onClick={() => handleRemoveDraft(loc.lokasiId)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Tab: Riwayat Tersimpan */}
          {tab === 'riwayat' && (
            loadingRiwayat ? (
              <div className="flex justify-center py-20">
                <svg className="animate-spin h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : riwayat.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-700 mb-1">Belum Ada Riwayat</h2>
                <p className="text-gray-400 text-sm mb-5">Generate dan simpan rencana kunjungan dari tab Lokasi Dipilih</p>
                <button onClick={() => setTab('draft')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Ke Lokasi Dipilih
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {riwayat.map((item) => {
                  const lokasiList = typeof item.lokasi_list === 'string' ? JSON.parse(item.lokasi_list) : (item.lokasi_list || []);
                  const isExpanded = expandedId === item.id;
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Header card riwayat */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{formatTanggal(item.tanggal)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.jam_mulai} – {item.jam_selesai} WITA &nbsp;·&nbsp;
                            {item.tipe_trip === 'solo' ? 'Solo Trip' : `Kelompok ${item.jumlah_orang} orang`} &nbsp;·&nbsp;
                            {lokasiList.length} lokasi
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400">{formatTanggalPendek(item.created_at)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleHapusRiwayat(item.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Detail riwayat (expand) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                          {item.catatan && (
                            <p className="text-xs text-gray-500 italic mb-2">📝 {item.catatan}</p>
                          )}
                          {lokasiList.map((loc, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-700 font-medium">{loc.name || loc.nama}</span>
                                {loc.gate && <span className="text-xs text-gray-400 ml-1.5">({loc.gate})</span>}
                              </div>
                              {(loc.mulai && loc.selesai) && (
                                <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {loc.mulai} – {loc.selesai}
                                </span>
                              )}
                              {loc.virtualTourId && (
                                <Link href={`/virtual-tour?tour_id=${loc.virtualTourId}`} className="text-xs text-blue-600 hover:underline flex-shrink-0">
                                  360°
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {showPlanModal && rencana.length > 0 && (
        <VisitPlanModal
          locations={rencana.map((l) => ({
            ...l,
            id: l.lokasiId,
            x: l.x ?? null,
            y: l.y ?? null,
            name: l.name || l.nama,
          }))}
          onClose={() => { setShowPlanModal(false); fetchRiwayat(); }}
        />
      )}
    </>
  );
}
