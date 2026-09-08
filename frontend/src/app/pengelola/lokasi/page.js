'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { koleksiService } from '../../../../lib/services/koleksi';
import Swal from 'sweetalert2';
import MapPicker from '../../../../components/MapPicker';

export default function PengelolaLokasiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lokasi, setLokasi] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLokasi, setEditingLokasi] = useState(null);

  const [filterTab, setFilterTab] = useState('all');
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kategori_id: '',
    urutan: 0,
    map_x: null,
    map_y: null,
    gate_number: '',
  });

  useEffect(() => {
    loadLokasi();
    loadKategori();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'tambah') {
      router.push('/pengelola/lokasi/tambah');
    }
  }, [searchParams]);

  const loadKategori = async () => {
    try {
      const response = await koleksiService.getKategori();
      setKategori(Array.isArray(response) ? response : (response.data || []));
    } catch { console.error('Error loading kategori'); }
  };

  const loadLokasi = async () => {
    try {
      const data = await koleksiService.getAllKoleksi();
      const list = Array.isArray(data) ? data : (data.data || []);
      setLokasi(list.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0)));
    } catch { console.error('Error loading lokasi'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kategori_id) {
      showAlert('Kategori lokasi wajib dipilih!', 'error');
      return;
    }
    try {
      if (editingLokasi) {
        await koleksiService.updateKoleksi(editingLokasi.id, formData);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Lokasi berhasil diupdate!', confirmButtonColor: '#16a34a' });
      } else {
        await koleksiService.createKoleksi(formData);
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Lokasi berhasil ditambahkan!', confirmButtonColor: '#16a34a' });
      }
      setShowForm(false);
      setEditingLokasi(null);
      setFormData({ nama: '', deskripsi: '', kategori_id: '', urutan: 0, map_x: null, map_y: null, gate_number: '' });
      loadLokasi();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Gagal menyimpan lokasi', confirmButtonColor: '#dc2626' });
    }
  };

  const handleEdit = (item) => {
    setEditingLokasi(item);
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi,
      kategori_id: item.kategori_id || '',
      urutan: item.urutan || 0,
      map_x: item.map_x ? parseFloat(item.map_x) : null,
      map_y: item.map_y ? parseFloat(item.map_y) : null,
      gate_number: item.gate_number || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Lokasi?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await koleksiService.deleteKoleksi(id);
        await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Lokasi berhasil dihapus', confirmButtonColor: '#16a34a' });
        loadLokasi();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || error.message || 'Gagal menghapus lokasi', confirmButtonColor: '#dc2626' });
      }
    }
  };

  const stats = {
    total: lokasi.length,
    denganPeta: lokasi.filter(l => l.map_x && l.map_y).length,
    tanpaPeta: lokasi.filter(l => !l.map_x || !l.map_y).length,
  };

  const filteredLokasi = lokasi.filter(item => {
    if (filterTab === 'peta') return item.map_x && item.map_y;
    if (filterTab === 'tanpa') return !item.map_x || !item.map_y;
    return true;
  });

  return (
    <div className="p-8">


      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Lokasi</h1>
          <p className="text-gray-600">Kelola lokasi kebun raya untuk virtual tour</p>
        </div>
        <button
          onClick={() => router.push('/pengelola/lokasi/tambah')}
          className="bg-[#16341B] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Lokasi
        </button>
      </div>

      {/* Form Modal - disabled, using full page instead */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="sticky bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{editingLokasi ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h2>
                  <p className="text-green-100 text-sm mt-1">
                    {editingLokasi ? `ID: ${editingLokasi.id} · Perbarui informasi lokasi` : 'Isi detail lokasi di kebun raya'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditingLokasi(null); setFormData({ nama: '', deskripsi: '', kategori_id: '', urutan: 0, map_x: null, map_y: null, gate_number: '' }); }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Informasi Dasar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Informasi Dasar</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lokasi <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Contoh: Taman Mawar"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Berikan nama yang jelas dan deskriptif</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                    <select
                      value={formData.kategori_id}
                      onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Pilih Kategori Lokasi</option>
                      {kategori.map(kat => <option key={kat.id} value={kat.id}>{kat.nama}</option>)}
                    </select>
                    {kategori.length === 0 && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Kategori belum tersedia. Hubungi admin untuk menambahkan kategori.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deskripsi & Detail */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Deskripsi & Detail</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi <span className="text-red-500">*</span></label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      rows="5"
                      placeholder="Deskripsikan lokasi ini secara detail..."
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Jelaskan keunikan dan daya tarik lokasi ini</p>
                      <span className="text-xs text-gray-400">{formData.deskripsi.length} karakter</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Tampilan</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        value={formData.urutan}
                        onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Angka kecil akan tampil lebih dulu (0 = paling awal)</p>
                  </div>
                </div>

                {/* Titik Lokasi di Peta */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Titik Lokasi di Peta</h3>
                  </div>
                  <MapPicker
                    value={{ x: formData.map_x, y: formData.map_y }}
                    onChange={({ x, y }) => setFormData(f => ({ ...f, map_x: x, map_y: y }))}
                    existingMarkers={lokasi
                      .filter(l => l.map_x && l.map_y && l.id !== editingLokasi?.id)
                      .map(l => ({ x: parseFloat(l.map_x), y: parseFloat(l.map_y), nama: l.nama }))}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Label Penanda</label>
                    <input
                      type="text"
                      value={formData.gate_number}
                      onChange={(e) => setFormData({ ...formData, gate_number: e.target.value })}
                      placeholder="Contoh: Gate 1, Area Parkir, Taman Mawar"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nama singkat yang muncul saat hover marker di peta.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl shadow-lg">
                <button
                  type="submit"
                  disabled={kategori.length === 0}
                  className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {editingLokasi ? 'Update Lokasi' : 'Simpan Lokasi'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingLokasi(null); setFormData({ nama: '', deskripsi: '', kategori_id: '', urutan: 0, map_x: null, map_y: null, gate_number: '' }); }}
                  className="flex-1 inline-flex items-center justify-center bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-all shadow-lg font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6 p-2">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Semua', count: stats.total },
            { key: 'peta', label: 'Sudah di Peta', count: stats.denganPeta },
            { key: 'tanpa', label: 'Belum di Peta', count: stats.tanpaPeta },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilterTab(tab.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${filterTab === tab.key ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.label} {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filterTab === tab.key ? 'bg-white text-green-600' : 'bg-gray-200'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Memuat data lokasi...</p>
          </div>
        </div>
      ) : lokasi.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Belum ada lokasi</p>
          <button onClick={() => router.push('/pengelola/lokasi/tambah')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            Tambah Lokasi Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Menampilkan <span className="font-semibold text-gray-700">{filteredLokasi.length}</span> lokasi</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lokasi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titik Peta</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Urutan</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLokasi.map((item, index) => (
                  <tr key={item.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-6 py-4"><span className="text-xs font-medium text-gray-400">{index + 1}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.nama}</p>
                          {item.deskripsi && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{item.deskripsi}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.kategori_nama ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">{item.kategori_nama}</span>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.map_x && item.map_y ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                          <span className="text-xs font-medium text-blue-700">{item.gate_number || 'Sudah diset'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></span>
                          <span className="text-xs text-gray-400">Belum diset</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">{item.urutan ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => router.push(`/pengelola/lokasi/edit?id=${item.id}`)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
