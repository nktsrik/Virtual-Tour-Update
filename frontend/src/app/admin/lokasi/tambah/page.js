'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { koleksiService } from '@/lib/services/koleksi';
import MapPicker from '@/components/MapPicker';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

function TambahLokasiAdminForm() {
  const router = useRouter();
  const [kategori, setKategori] = useState([]);
  const [existingLokasi, setExistingLokasi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kategori_id: '',
    urutan: 0,
    map_x: null,
    map_y: null,
    gate_number: '',
    estimasi_durasi: 30,
    keterangan_durasi: '',
  });

  useEffect(() => {
    const loadKategori = async () => {
      try {
        const response = await koleksiService.getKategori();
        setKategori(Array.isArray(response) ? response : (response.data || []));
      } catch { console.error('Error loading kategori'); }
    };
    const loadExistingLokasi = async () => {
      try {
        const data = await koleksiService.getAllKoleksi();
        const list = Array.isArray(data) ? data : (data.data || []);
        setExistingLokasi(list.filter(l => l.map_x && l.map_y));
      } catch { console.error('Error loading existing lokasi'); }
    };
    loadKategori();
    loadExistingLokasi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kategori_id) {
      Swal.fire({ icon: 'warning', title: 'Kategori Belum Dipilih', text: 'Silakan pilih kategori lokasi terlebih dahulu', confirmButtonColor: '#059669' });
      return;
    }
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const body = new FormData();
      body.append('nama', formData.nama);
      body.append('deskripsi', formData.deskripsi);
      body.append('kategori_id', formData.kategori_id);
      body.append('urutan', formData.urutan || 0);
      body.append('map_x', formData.map_x ?? '');
      body.append('map_y', formData.map_y ?? '');
      body.append('gate_number', formData.gate_number);
      body.append('estimasi_durasi', parseInt(formData.estimasi_durasi) || 30);
      body.append('keterangan_durasi', formData.keterangan_durasi || '');
      if (thumbnailFile) body.append('thumbnail', thumbnailFile);

      const res = await fetch(`${API_URL}/api/lokasi`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Server error');
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Lokasi berhasil ditambahkan', confirmButtonColor: '#059669' });
      router.push('/admin/lokasi');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', confirmButtonColor: '#059669' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.push('/admin/lokasi')}
            className="flex items-center text-green-700 hover:text-green-800 mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Lokasi
          </button>
          <h1 className="text-3xl font-bold text-green-800">Tambah Lokasi Baru</h1>
          <p className="text-gray-600 mt-2">Isi detail lokasi kebun raya untuk virtual tour</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lokasi <span className="text-red-500">*</span></label>
              <input type="text" value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                placeholder="Contoh: Taman Mawar" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={formData.kategori_id}
                  onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none appearance-none bg-white cursor-pointer"
                  required>
                  <option value="">-- Pilih Kategori --</option>
                  {kategori.map((kat) => <option key={kat.id} value={kat.id}>{kat.nama}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {kategori.length === 0 && (
                <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 border border-yellow-200 rounded p-2">
                  Kategori belum tersedia. Hubungi admin untuk menambahkan kategori.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi <span className="text-red-500">*</span></label>
              <textarea value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                rows={5}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                placeholder="Deskripsikan lokasi ini secara detail..." required />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Jelaskan keunikan dan daya tarik lokasi ini</p>
                <span className="text-xs text-gray-400">{formData.deskripsi.length} karakter</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Tampilan</label>
              <input type="number" value={formData.urutan}
                onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                min="0" placeholder="0" />
              <p className="text-xs text-gray-500 mt-1">Angka kecil akan tampil lebih dulu (0 = paling awal)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Lokasi <span className="text-gray-400">(Opsional)</span></label>
              <div className="flex items-start gap-4">
                {thumbnailPreview && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                      ×
                    </button>
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">{thumbnailFile ? thumbnailFile.name : 'Klik untuk upload gambar'}</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Maks 5MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setThumbnailFile(file); setThumbnailPreview(URL.createObjectURL(file)); }
                    }} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Titik Lokasi di Peta <span className="text-gray-400">(Opsional)</span></label>
              <MapPicker
                value={{ x: formData.map_x, y: formData.map_y }}
                onChange={({ x, y }) => setFormData(f => ({ ...f, map_x: x, map_y: y }))}
                existingMarkers={existingLokasi.map(l => ({ x: parseFloat(l.map_x), y: parseFloat(l.map_y), nama: l.nama }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Label Penanda <span className="text-gray-400">(Opsional)</span></label>
              <input type="text" value={formData.gate_number}
                onChange={(e) => setFormData({ ...formData, gate_number: e.target.value })}
                placeholder="Contoh: Gate 1, Area Parkir, Taman Mawar"
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none" />
              <p className="text-xs text-gray-500 mt-1">Nama singkat yang muncul saat hover marker di peta.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estimasi Durasi Kunjungan (menit)</label>
              <input type="number" value={formData.estimasi_durasi}
                onChange={(e) => setFormData({ ...formData, estimasi_durasi: parseInt(e.target.value) || 30 })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                min="5" max="120" placeholder="30" />
              <p className="text-xs text-gray-500 mt-1">Digunakan untuk menghitung jadwal rencana kunjungan wisatawan. Default: 30 menit.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan Durasi <span className="text-gray-400">(Opsional)</span></label>
              <input type="text" value={formData.keterangan_durasi}
                onChange={(e) => setFormData({ ...formData, keterangan_durasi: e.target.value })}
                placeholder="Contoh: Area luas dengan 500+ koleksi tanaman, perlu waktu lebih"
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none" />
              <p className="text-xs text-gray-500 mt-1">Alasan mengapa lokasi ini membutuhkan durasi tersebut. Ditampilkan ke pengunjung saat membuat rencana kunjungan.</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={() => router.push('/admin/lokasi')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Batal
              </button>
              <button type="submit" disabled={loading || kategori.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Menyimpan...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Simpan Lokasi</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminTambahLokasi() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <TambahLokasiAdminForm />
    </Suspense>
  );
}
