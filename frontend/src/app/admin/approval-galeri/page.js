'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { galeriService } from '../../../../lib/services/galeri';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ApprovalGaleriPage() {
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGaleri, setSelectedGaleri] = useState(null);

  useEffect(() => { loadGaleri(); }, []);

  useEffect(() => {
    document.body.style.overflow = selectedGaleri ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedGaleri]);

  const loadGaleri = async () => {
    try {
      setLoading(true);
      const response = await galeriService.getAllGaleri();
      const all = Array.isArray(response) ? response : (response.data || []);
      setGaleriList(all.filter(g => g.status_id === 2));
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat data galeri', confirmButtonColor: '#dc2626' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const confirm = await Swal.fire({
      title: 'Approve Galeri?', text: 'Galeri akan dipublikasikan dan dapat diakses publik',
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Approve', cancelButtonText: 'Batal'
    });
    if (confirm.isConfirmed) {
      try {
        await galeriService.approveGaleri(id);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri telah disetujui dan dipublikasikan', confirmButtonColor: '#16a34a' });
        setSelectedGaleri(null);
        loadGaleri();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const handleRevise = async (id) => {
    const { value: alasan, isConfirmed } = await Swal.fire({
      icon: 'warning', title: 'Minta Perbaikan?',
      html: '<p class="text-sm text-gray-600 mb-2">Galeri akan dikembalikan ke <strong>draft</strong>. Pengelola dapat mengedit dan submit ulang.</p>',
      input: 'textarea', inputLabel: 'Catatan Perbaikan',
      inputPlaceholder: 'Tuliskan bagian yang perlu diperbaiki...',
      showCancelButton: true, confirmButtonColor: '#d97706', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Minta Perbaikan', cancelButtonText: 'Batal',
      inputValidator: (value) => { if (!value) return 'Catatan perbaikan wajib diisi!'; }
    });
    if (isConfirmed && alasan) {
      try {
        await galeriService.reviseGaleri(id, alasan);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri dikembalikan ke draft untuk diperbaiki', confirmButtonColor: '#16a34a' });
        setSelectedGaleri(null);
        loadGaleri();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const handleReject = async (id) => {
    const { value: alasan } = await Swal.fire({
      title: 'Tolak Galeri?',
      html: '<p class="text-sm text-gray-600 mb-2">Galeri akan ditolak <strong>permanen</strong>. Pengelola harus membuat ulang dari awal.</p>',
      input: 'textarea', inputLabel: 'Alasan Penolakan', inputPlaceholder: 'Tuliskan alasan penolakan...',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Tolak Permanen', cancelButtonText: 'Batal',
      inputValidator: (value) => { if (!value) return 'Alasan penolakan wajib diisi!'; }
    });
    if (alasan) {
      try {
        await galeriService.rejectGaleri(id, alasan);
        await Swal.fire({ icon: 'success', title: 'Ditolak!', text: 'Galeri telah ditolak permanen.', confirmButtonColor: '#16a34a' });
        setSelectedGaleri(null);
        loadGaleri();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approval Galeri Media</h1>
          <p className="text-gray-600">Review dan approve galeri yang disubmit pengelola</p>
        </div>
        <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${galeriList.length > 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
          {galeriList.length > 0 ? `${galeriList.length} Menunggu Review` : 'Semua Sudah Direview'}
        </span>
      </div>

      {/* Alert */}
      {galeriList.length > 0 && (
        <div className="bg-white border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-2 h-10 bg-yellow-400 rounded-full flex-shrink-0" />
          <p className="text-sm font-medium text-gray-800">
            <strong>{galeriList.length}</strong> galeri menunggu review. Klik <strong>Preview</strong> untuk melihat detail dan melakukan tindakan.
          </p>
        </div>
      )}

      {/* Table */}
      {galeriList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-1">Tidak Ada Galeri Pending</p>
          <p className="text-gray-400 text-sm">Semua galeri sudah direview</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Galeri</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengelola</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {galeriList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4"><span className="text-xs font-medium text-gray-400">{index + 1}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`${API_URL}${item.file_path}`} alt={item.judul}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.judul}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{item.deskripsi?.replace(/<[^>]*>/g, '') || 'Tidak ada deskripsi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.lokasi_nama ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">{item.lokasi_nama}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="text-xs text-gray-600">{item.created_by_nama || 'Pengelola'}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedGaleri(item)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">Preview</button>
                        <button onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">Approve</button>
                        <button onClick={() => handleRevise(item.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors">Perbaiki</button>
                        <button onClick={() => handleReject(item.id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">Tolak</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Full Page */}
      {selectedGaleri && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', background: '#f8fafc' }}>
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <button onClick={() => setSelectedGaleri(null)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Daftar
            </button>
            <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-yellow-100 text-yellow-800 border-yellow-300">Pending Review</span>
          </div>
          <div className="max-w-3xl mx-auto py-10 px-6">
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8 bg-gray-100">
              <img src={`${API_URL}${selectedGaleri.file_path}`} alt={selectedGaleri.judul}
                className="w-full object-cover" style={{ maxHeight: '480px', objectFit: 'cover' }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{selectedGaleri.judul}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              {selectedGaleri.lokasi_nama && (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  {selectedGaleri.lokasi_nama}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                {selectedGaleri.created_by_nama || 'Pengelola'}
              </span>
            </div>
            {selectedGaleri.deskripsi && (
              <div
                className="article-content text-gray-700 text-base leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: selectedGaleri.deskripsi }}
              />
            )}
            <style>{`
              .article-content p { margin-bottom: 0.75rem; }
              .article-content h1, .article-content h2, .article-content h3 { font-weight: 700; color: #166534; margin: 1.25rem 0 0.5rem; }
              .article-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
              .article-content ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
              .article-content blockquote { border-left: 4px solid #16a34a; padding-left: 1rem; font-style: italic; color: #4b5563; margin: 1rem 0; }
              .article-content strong { font-weight: 700; }
              .article-content img { max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0; }
            `}</style>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Tindakan Review</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setSelectedGaleri(null); handleApprove(selectedGaleri.id); }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium text-sm transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Setujui & Publikasikan
                </button>
                <button onClick={() => { setSelectedGaleri(null); handleRevise(selectedGaleri.id); }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-medium text-sm transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  Minta Perbaikan
                </button>
                <button onClick={() => { setSelectedGaleri(null); handleReject(selectedGaleri.id); }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium text-sm transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  Tolak Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
