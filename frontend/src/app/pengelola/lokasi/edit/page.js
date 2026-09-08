'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import MapPicker from '@/components/MapPicker';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function EditLokasiForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [form, setForm] = useState({
    nama: '',
    kategori_id: '',
    deskripsi: '',
    urutan: 0,
    map_x: null,
    map_y: null,
    gate_number: '',
    estimasi_durasi: 30,
    keterangan_durasi: '',
  });
  const [kategoriList, setKategoriList] = useState([]);
  const [existingLokasi, setExistingLokasi] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lokasiRes, kategoriRes, semuaLokasiRes] = await Promise.all([
          fetch(`${API_URL}/api/lokasi/${id}`),
          fetch(`${API_URL}/api/lokasi/kategori/list`),
          fetch(`${API_URL}/api/lokasi`),
        ]);
        const lokasiData = await lokasiRes.json();
        const kategoriData = await kategoriRes.json();
        const semuaLokasiData = await semuaLokasiRes.json();

        if (lokasiData.success) {
          const lokasi = lokasiData.data;
          setForm({
            nama: lokasi.nama || '',
            kategori_id: lokasi.kategori_id || '',
            deskripsi: lokasi.deskripsi || '',
            urutan: lokasi.urutan || 0,
            map_x: lokasi.map_x ? parseFloat(lokasi.map_x) : null,
            map_y: lokasi.map_y ? parseFloat(lokasi.map_y) : null,
            gate_number: lokasi.gate_number || '',
            estimasi_durasi: lokasi.estimasi_durasi || 30,
            keterangan_durasi: lokasi.keterangan_durasi || '',
          });
          if (lokasi.thumbnail) {
            setCurrentThumbnail(lokasi.thumbnail.startsWith('http') ? lokasi.thumbnail : `${API_URL}/${lokasi.thumbnail.replace(/^\//, '')}`);
          }
        }
        if (kategoriData.success) setKategoriList(kategoriData.data);

        const semuaList = Array.isArray(semuaLokasiData) ? semuaLokasiData : (semuaLokasiData.data || []);
        setExistingLokasi(semuaList.filter(l => l.map_x && l.map_y && String(l.id) !== String(id)));
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: 'Terjadi kesalahan saat memuat data lokasi', confirmButtonColor: '#059669' });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.kategori_id) {
      Swal.fire({ icon: 'warning', title: 'Kategori Belum Dipilih', text: 'Silakan pilih kategori lokasi terlebih dahulu', confirmButtonColor: '#059669' });
      return;
    }
    setSubmitting(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        Swal.fire({ icon: 'error', title: 'Belum Login', text: 'Silakan login terlebih dahulu', confirmButtonColor: '#059669' });
        router.push('/login');
        return;
      }

      const body = new FormData();
      body.append('nama', form.nama);
      body.append('kategori_id', form.kategori_id);
      body.append('deskripsi', form.deskripsi);
      body.append('urutan', form.urutan || 0);
      body.append('map_x', form.map_x ?? '');
      body.append('map_y', form.map_y ?? '');
      body.append('gate_number', form.gate_number);
      body.append('estimasi_durasi', parseInt(form.estimasi_durasi) || 30);
      body.append('keterangan_durasi', form.keterangan_durasi || '');
      if (thumbnailFile) body.append('thumbnail', thumbnailFile);

      const res = await fetch(`${API_URL}/api/lokasi/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Server error');
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Lokasi berhasil diperbarui', confirmButtonColor: '#059669' });
      router.push('/pengelola/lokasi');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message || 'Terjadi kesalahan saat memperbarui data', confirmButtonColor: '#059669' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="text-green-800 font-medium">Memuat data lokasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.push('/pengelola/lokasi')}
            className="flex items-center text-green-700 hover:text-green-800 mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Lokasi
          </button>
          <h1 className="text-3xl font-bold text-green-800">Edit Lokasi</h1>
          <p className="text-gray-600 mt-2">ID Lokasi: <span className="font-semibold text-green-700">#{id}</span> · Perbarui informasi lokasi yang sudah ada</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lokasi <span className="text-red-500">*</span></label>
              <input type="text" name="nama" value={form.nama} onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                placeholder="Contoh: Taman Mawar" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Lokasi <span className="text-red-500">*</span></label>
              <div className="relative">
                <select name="kategori_id" value={form.kategori_id} onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none appearance-none bg-white cursor-pointer"
                  required>
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange}
                rows={5}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                placeholder="Deskripsikan lokasi dengan detail..." required />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Jelaskan keunikan dan daya tarik lokasi ini</p>
                <span className="text-xs text-gray-400">{form.deskripsi.length} karakter</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Tampilan</label>
              <input type="number" name="urutan" value={form.urutan} onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                min="0" placeholder="0" />
              <p className="text-xs text-gray-500 mt-1">Angka kecil akan tampil lebih dulu (0 = paling awal)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Lokasi <span className="text-gray-400">(Opsional)</span></label>
              <div className="flex items-start gap-4">
                {(thumbnailPreview || currentThumbnail) && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={thumbnailPreview || currentThumbnail} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); setCurrentThumbnail(null); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                      ×
                    </button>
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">{thumbnailFile ? thumbnailFile.name : 'Klik untuk ganti gambar'}</span>
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
                value={{ x: form.map_x, y: form.map_y }}
                onChange={({ x, y }) => setForm(f => ({ ...f, map_x: x, map_y: y }))}
                existingMarkers={existingLokasi.map(l => ({ x: parseFloat(l.map_x), y: parseFloat(l.map_y), nama: l.nama }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Label Penanda <span className="text-gray-400">(Opsional)</span></label>
              <input type="text" name="gate_number" value={form.gate_number} onChange={handleChange}
                placeholder="Contoh: Gate 1, Area Parkir, Taman Mawar"
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none" />
              <p className="text-xs text-gray-500 mt-1">Nama singkat yang muncul saat hover marker di peta.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estimasi Durasi Kunjungan (menit)</label>
              <input type="number" name="estimasi_durasi" value={form.estimasi_durasi} onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                min="5" max="120" placeholder="30" />
              <p className="text-xs text-gray-500 mt-1">Digunakan untuk menghitung jadwal rencana kunjungan wisatawan. Default: 30 menit.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan Durasi <span className="text-gray-400">(Opsional)</span></label>
              <input type="text" name="keterangan_durasi" value={form.keterangan_durasi} onChange={handleChange}
                placeholder="Contoh: Area luas dengan 500+ koleksi tanaman, perlu waktu lebih"
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none" />
              <p className="text-xs text-gray-500 mt-1">Alasan mengapa lokasi ini membutuhkan durasi tersebut. Ditampilkan ke pengunjung saat membuat rencana kunjungan.</p>
            </div>
              <button type="button" onClick={() => router.push('/pengelola/lokasi')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Batal</button>
              <button type="submit" disabled={submitting || kategoriList.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
                {submitting ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Memperbarui...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Perbarui Lokasi</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditLokasi() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <EditLokasiForm />
    </Suspense>
  );
}
