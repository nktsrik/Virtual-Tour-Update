'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { galeriService } from '../../../../lib/services/galeri';
import { koleksiService } from '../../../../lib/services/koleksi';
import RichTextEditor from '../../../../components/ui/RichTextEditor';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function PengelolaGaleriPage() {
  const router = useRouter();
  const [galeriList, setGaleriList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ judul: '', deskripsi: '', lokasi_id: '', is_featured: false, urutan: 0, image: null });

  useEffect(() => { loadGaleri(); loadLokasi(); }, []);

  const loadGaleri = async () => {
    try {
      const response = await galeriService.getAllGaleri();
      setGaleriList(Array.isArray(response) ? response : (response.data || []));
    } catch { console.error('Error loading galeri'); }
    finally { setLoading(false); }
  };

  const loadLokasi = async () => {
    try {
      const response = await koleksiService.getAllKoleksi();
      setLokasiList(Array.isArray(response) ? response : (response.data || []));
    } catch { console.error('Error loading lokasi'); }
  };

  const resetForm = () => {
    setFormData({ judul: '', deskripsi: '', lokasi_id: '', is_featured: false, urutan: 0, image: null });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.image) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(formData.image.type)) {
          await Swal.fire({ icon: 'error', title: 'Format Tidak Didukung', text: 'Hanya JPG, PNG, atau WEBP', confirmButtonColor: '#dc2626' });
          return;
        }
        if (formData.image.size > 50 * 1024 * 1024) {
          await Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: 'Maksimal 50MB', confirmButtonColor: '#dc2626' });
          return;
        }
      }
      if (editingItem) {
        await galeriService.updateGaleri(editingItem.id, formData);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri berhasil diupdate', confirmButtonColor: '#16a34a' });
      } else {
        await galeriService.createGaleri(formData);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri berhasil ditambahkan', confirmButtonColor: '#16a34a' });
      }
      resetForm();
      loadGaleri();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
    }
  };

  const handleEdit = (item) => {
    router.push(`/pengelola/galeri/edit?id=${item.id}`);
  };

  const handleSubmitReview = async (id) => {
    const confirm = await Swal.fire({
      icon: 'question', title: 'Submit untuk Review?', text: 'Galeri akan dikirim ke admin untuk ditinjau',
      showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Submit', cancelButtonText: 'Batal',
    });
    if (confirm.isConfirmed) {
      try {
        await galeriService.submitForReview(id);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri berhasil disubmit untuk review', confirmButtonColor: '#16a34a' });
        loadGaleri();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: 'Hapus Galeri?', text: 'Data yang dihapus tidak dapat dikembalikan',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal',
    });
    if (confirm.isConfirmed) {
      try {
        await galeriService.deleteGaleri(id);
        await Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Galeri berhasil dihapus', confirmButtonColor: '#16a34a' });
        loadGaleri();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const getStatusBadge = (status_id) => {
    const map = {
      1: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-300' },
      2: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      3: { label: 'Published', color: 'bg-green-100 text-green-800 border-green-300' },
      4: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
    };
    const s = map[status_id] || map[1];
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${s.color}`}>{s.label}</span>;
  };

  const stats = {
    total: galeriList.length,
    draft: galeriList.filter(g => g.status_id === 1).length,
    pending: galeriList.filter(g => g.status_id === 2).length,
    published: galeriList.filter(g => g.status_id === 3).length,
    rejected: galeriList.filter(g => g.status_id === 4).length,
  };

  const filteredList = galeriList.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'draft') return g.status_id === 1;
    if (filter === 'pending') return g.status_id === 2;
    if (filter === 'published') return g.status_id === 3;
    if (filter === 'rejected') return g.status_id === 4;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat data galeri...</p>
      </div>
    </div>
  );

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Kelola Galeri Media</h1>
          <p className="text-gray-500 text-sm">Upload foto dan artikel tentang lokasi kebun raya</p>
        </div>
        <button onClick={() => router.push('/pengelola/galeri/tambah')}
          className="bg-[#16341B] text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Galeri
        </button>
      </div>

      {/* Form Modal - REMOVED, now full page */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{editingItem ? 'Edit Galeri' : 'Tambah Galeri Baru'}</h2>
                  <p className="text-green-100 text-sm">{editingItem ? 'Perbarui informasi galeri' : 'Upload foto atau artikel baru'}</p>
                </div>
              </div>
              <button onClick={resetForm} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judul <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Judul galeri / artikel" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi / Artikel</label>
                  <RichTextEditor value={formData.deskripsi} onChange={(val) => setFormData({ ...formData, deskripsi: val })}
                    placeholder="Tulis deskripsi atau artikel tentang lokasi ini..." />
                  <p className="text-xs text-gray-400 mt-1">Gunakan toolbar untuk format teks</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                  <select value={formData.lokasi_id} onChange={(e) => setFormData({ ...formData, lokasi_id: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                    <option value="">-- Pilih Lokasi --</option>
                    {lokasiList.map((loc) => <option key={loc.id} value={loc.id}>{loc.nama}</option>)}
                  </select>
                </div>

                {!editingItem && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar <span className="text-red-500">*</span></label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <label className="cursor-pointer">
                        <span className="text-sm font-medium text-gray-700">Pilih gambar</span>
                        <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="sr-only" required />
                      </label>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Maks 50MB</p>
                    </div>
                    {formData.image && (
                      <p className="text-xs text-green-700 mt-2 font-medium">✓ {formData.image.name}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Tampil</label>
                    <input type="number" value={formData.urutan}
                      onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" min="0" />
                  </div>
                  <div className="flex items-center gap-2 mt-8">
                    <input type="checkbox" id="is_featured" checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-green-600" />
                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Tampilkan sebagai Unggulan</label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl">
                <button type="button" onClick={resetForm}
                  className="flex-1 inline-flex items-center justify-center bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all font-medium">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium">
                  {editingItem ? 'Update Galeri' : 'Simpan Galeri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-4 p-1.5">
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'Semua', count: stats.total },
            { key: 'draft', label: 'Draft', count: stats.draft },
            { key: 'pending', label: 'Pending Review', count: stats.pending },
            { key: 'published', label: 'Published', count: stats.published },
            { key: 'rejected', label: 'Ditolak', count: stats.rejected },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${filter === tab.key ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.label} {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white text-green-600' : 'bg-gray-200'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm mb-1">Tidak ada galeri</p>
            <p className="text-gray-400 text-xs">Klik &quot;Tambah Galeri&quot; untuk memulai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Galeri</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={`${API_URL}${item.file_path}`} alt={item.judul}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.judul}</p>
                          {item.alasan_penolakan && <p className="text-xs text-red-500 mt-0.5">❌ {item.alasan_penolakan}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-700">{item.lokasi_nama || '-'}</span></td>
                    <td className="px-4 py-3">{getStatusBadge(item.status_id)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(item.status_id === 1 || item.status_id === 4) && (
                          <button onClick={() => handleEdit(item)} className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors">Edit</button>
                        )}
                        {(item.status_id === 1 || item.status_id === 4) && (
                          <button onClick={() => handleSubmitReview(item.id)} className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-md transition-colors">Submit Review</button>
                        )}
                        {item.status_id === 2 && (
                          <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md">Menunggu Approval</span>
                        )}
                        {(item.status_id === 1 || item.status_id === 4) && (
                          <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors">Hapus</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Draft */}
      {stats.draft > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">ℹ️ Anda memiliki <strong>{stats.draft}</strong> galeri dalam status Draft. Klik &quot;Submit Review&quot; untuk mengirim ke admin.</p>
        </div>
      )}
    </div>
  );
}
