'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { virtualTourService } from '../../../../lib/services/virtualTour';
import Swal from 'sweetalert2';
import Script from 'next/script';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function PanoramaModal({ tour, onClose, onApprove, onRevise, onReject }) {
  const [pannellumReady, setPannellumReady] = useState(!!window.pannellum);
  const viewerRef = useRef(null);

  // Init viewer setelah pannellum ready dan DOM tersedia
  useEffect(() => {
    if (!pannellumReady) return;

    const main = document.getElementById('admin-main');
    if (main) main.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const init = () => {
      const el = document.getElementById('approval-pano');
      if (!el) { setTimeout(init, 50); return; }
      if (el.offsetWidth === 0 || el.offsetHeight === 0) { setTimeout(init, 50); return; }

      if (viewerRef.current) { try { viewerRef.current.destroy(); } catch(e) {} viewerRef.current = null; }

      viewerRef.current = window.pannellum.viewer('approval-pano', {
        type: 'equirectangular',
        panorama: `${API_URL}${tour.image_path}`,
        autoLoad: true,
        pitch: tour.pitch || 0,
        yaw: tour.yaw || 0,
        hfov: tour.hfov || 100,
        showControls: true,
        mouseZoom: true,
        draggable: true,
        showFullscreenCtrl: false,
      });
    };

    setTimeout(init, 150);

    return () => {
      if (main) main.style.overflow = '';
      document.body.style.overflow = '';
      if (viewerRef.current) { try { viewerRef.current.destroy(); } catch(e) {} viewerRef.current = null; }
    };
  }, [pannellumReady, tour]);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', background: '#111' }}>
      {!pannellumReady && (
        <Script
          src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
          strategy="afterInteractive"
          onLoad={() => setPannellumReady(true)}
        />
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">{tour.nama}</h2>
            <p className="text-green-100 text-xs">{tour.lokasi_nama || `Lokasi #${tour.lokasi_id}`} · Preview 360°</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* 360 Viewer — pakai ref langsung, bukan id */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <div id="approval-pano" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          {!pannellumReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none" style={{ zIndex: 10 }}>
            🖱 Drag untuk memutar · Scroll untuk zoom
          </div>
        </div>

        {/* Panel Info */}
        <div className="w-80 bg-gray-900 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Judul</p><p className="text-white font-semibold">{tour.nama}</p></div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Lokasi</p>
              <span className="inline-flex items-center px-2.5 py-1 text-xs bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-full font-medium">{tour.lokasi_nama || `Lokasi #${tour.lokasi_id}`}</span>
            </div>
            <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Deskripsi</p><p className="text-gray-300 text-sm leading-relaxed">{tour.deskripsi || 'Tidak ada deskripsi'}</p></div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[{ label: 'Pitch', value: `${tour.pitch || 0}°` }, { label: 'Yaw', value: `${tour.yaw || 0}°` }, { label: 'HFOV', value: `${tour.hfov || 100}°` }].map(item => (
                <div key={item.label} className="bg-gray-800 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
            <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tanggal Submit</p><p className="text-gray-300 text-sm">{new Date(tour.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dibuat Oleh</p><p className="text-gray-300 text-sm">User #{tour.created_by}</p></div>
          </div>
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button onClick={() => { onClose(); onApprove(tour.id); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Approve & Publikasikan
            </button>
            <button onClick={() => { onClose(); onRevise(tour.id); }} className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              Minta Perbaikan
            </button>
            <button onClick={() => { onClose(); onReject(tour.id); }} className="w-full inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Tolak Permanen
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body);
}

export default function AdminApprovalPage() {
  const [pendingTours, setPendingTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { loadPendingTours(); }, []);

  const loadPendingTours = async () => {
    try {
      setLoading(true);
      const response = await virtualTourService.getPendingTours();
      setPendingTours(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      if (error.response?.status === 403) {
        await Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Hanya admin yang dapat mengakses halaman ini', confirmButtonColor: '#dc2626' });
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Approve Virtual Tour?', text: 'Virtual tour akan dipublikasikan dan dapat diakses publik',
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Approve', cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        await virtualTourService.approveTour(id);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Virtual tour telah disetujui dan dipublikasikan', confirmButtonColor: '#16a34a' });
        setSelectedTour(null);
        loadPendingTours();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Gagal menyetujui virtual tour', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const handleReject = async (id) => {
    const { value: alasan } = await Swal.fire({
      title: 'Tolak Virtual Tour?',
      html: '<p class="text-sm text-gray-600 mb-2">Virtual tour akan ditolak <strong>permanen</strong>. Pengelola harus membuat ulang dari awal.</p>',
      input: 'textarea', inputLabel: 'Alasan Penolakan', inputPlaceholder: 'Tuliskan alasan penolakan...',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Tolak Permanen', cancelButtonText: 'Batal',
      inputValidator: (value) => { if (!value) return 'Alasan penolakan wajib diisi!'; }
    });
    if (alasan) {
      try {
        await virtualTourService.rejectTour(id, alasan);
        await Swal.fire({ icon: 'success', title: 'Ditolak!', text: 'Virtual tour telah ditolak permanen.', confirmButtonColor: '#16a34a' });
        setSelectedTour(null);
        loadPendingTours();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Gagal menolak virtual tour', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const handleRevise = async (id) => {
    const { value: alasan } = await Swal.fire({
      title: 'Minta Perbaikan?',
      html: '<p class="text-sm text-gray-600 mb-2">Virtual tour akan dikembalikan ke <strong>draft</strong>. Pengelola dapat mengedit dan submit ulang.</p>',
      input: 'textarea', inputLabel: 'Catatan Perbaikan', inputPlaceholder: 'Tuliskan bagian yang perlu diperbaiki...',
      showCancelButton: true, confirmButtonColor: '#d97706', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Minta Perbaikan', cancelButtonText: 'Batal',
      inputValidator: (value) => { if (!value) return 'Catatan perbaikan wajib diisi!'; }
    });
    if (alasan) {
      try {
        await virtualTourService.reviseTour(id, alasan);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Virtual tour dikembalikan ke draft untuk diperbaiki.', confirmButtonColor: '#16a34a' });
        setSelectedTour(null);
        loadPendingTours();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Gagal meminta perbaikan', confirmButtonColor: '#dc2626' });
      }
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css" />
      <Script
        src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
        strategy="afterInteractive"
      />
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Approval VR</h1>
            <p className="text-gray-600">Tinjau dan setujui virtual tour yang disubmit oleh pengelola</p>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${pendingTours.length > 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
            {pendingTours.length > 0 ? `${pendingTours.length} Menunggu Review` : 'Semua Sudah Direview'}
          </span>
        </div>

        {/* Alert pending */}
        {pendingTours.length > 0 && (
          <div className="bg-white border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="w-2 h-10 bg-yellow-400 rounded-full flex-shrink-0" />
            <p className="text-sm font-medium text-gray-800">
              <strong>{pendingTours.length}</strong> virtual tour menunggu untuk direview. Klik pada baris untuk melihat detail dan melakukan tindakan.
            </p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Memuat data...</p>
            </div>
          </div>
        ) : pendingTours.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-1">Tidak Ada Virtual Tour Pending</p>
            <p className="text-gray-400 text-sm">Semua virtual tour sudah direview</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Menampilkan <span className="font-semibold text-gray-700">{pendingTours.length}</span> virtual tour pending</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Virtual Tour</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dibuat Oleh</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingTours.map((tour, index) => (
                    <tr key={tour.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-6 py-4"><span className="text-xs font-medium text-gray-400">{index + 1}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tour.image_path ? (
                            <img src={`${API_URL}${tour.image_path}`} alt={tour.nama}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"
                            style={{ display: tour.image_path ? 'none' : 'flex' }}>
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{tour.nama}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{tour.deskripsi || 'Tidak ada deskripsi'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tour.lokasi_nama ? (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">{tour.lokasi_nama}</span>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Lokasi #{tour.lokasi_id}</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><span className="text-xs text-gray-600">User #{tour.created_by}</span></td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(tour.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setSelectedTour(tour)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors">Preview</button>
                          <button onClick={() => handleApprove(tour.id)}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors">Approve</button>
                          <button onClick={() => handleRevise(tour.id)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-md transition-colors">Perbaiki</button>
                          <button onClick={() => handleReject(tour.id)}
                            className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors">Tolak</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mounted && selectedTour && (
          <PanoramaModal
            tour={selectedTour}
            onClose={() => setSelectedTour(null)}
            onApprove={handleApprove}
            onRevise={handleRevise}
            onReject={handleReject}
          />
        )}
      </div>
    </>
  );
}
