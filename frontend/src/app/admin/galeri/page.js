'use client';
import { useState, useEffect } from 'react';
import { galeriService } from '../../../../lib/services/galeri';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const STATUS_MAP = {
  1: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  2: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  3: { label: 'Published', color: 'bg-green-100 text-green-800 border-green-300' },
  4: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

const getStatusBadge = (status_id) => {
  const s = STATUS_MAP[status_id] || STATUS_MAP[1];
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${s.color}`}>{s.label}</span>;
};

export default function AdminGaleriPage() {
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadGaleri(); }, []);

  const loadGaleri = async () => {
    try {
      setLoading(true);
      const response = await galeriService.getAllGaleri();
      setGaleriList(Array.isArray(response) ? response : (response.data || []));
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat data galeri', confirmButtonColor: '#dc2626' });
    } finally {
      setLoading(false);
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

  const stats = {
    total: galeriList.length,
    pending: galeriList.filter(g => g.status_id === 2).length,
    published: galeriList.filter(g => g.status_id === 3).length,
    draft: galeriList.filter(g => g.status_id === 1).length,
    rejected: galeriList.filter(g => g.status_id === 4).length,
  };

  const filteredList = galeriList.filter(g => {
    if (filter === 'pending') return g.status_id === 2;
    if (filter === 'published') return g.status_id === 3;
    if (filter === 'draft') return g.status_id === 1;
    if (filter === 'rejected') return g.status_id === 4;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Galeri Media</h1>
          <p className="text-gray-600">Daftar semua konten galeri media</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6 p-2">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Semua', count: stats.total },
            { key: 'pending', label: 'Pending Review', count: stats.pending },
            { key: 'published', label: 'Published', count: stats.published },
            { key: 'draft', label: 'Draft', count: stats.draft },
            { key: 'rejected', label: 'Ditolak', count: stats.rejected },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${filter === tab.key ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.label} {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white text-green-600' : 'bg-gray-200'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg">Tidak ada galeri dengan status ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-8">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Galeri</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pengelola</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="text-xs font-medium text-gray-400">{index + 1}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`${API_URL}${item.file_path}`} alt={item.judul}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.judul}</p>
                          {item.alasan_penolakan && <p className="text-xs text-red-500 mt-1">❌ {item.alasan_penolakan}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.lokasi_nama ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">{item.lokasi_nama}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700">{item.created_by_nama || 'Pengelola'}</span></td>
                    <td className="px-6 py-4">{getStatusBadge(item.status_id)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
