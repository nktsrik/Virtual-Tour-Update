'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { virtualTourService } from '@/lib/services/virtualTour';
import { koleksiService } from '@/lib/services/koleksi';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function EditVirtualTourForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tour, setTour] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lokasi_id: '',
    urutan: 1,
    pitch: 0,
    yaw: 0,
    hfov: 100,
    image: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tourRes, lokasiRes] = await Promise.all([
          virtualTourService.getTourById(id),
          koleksiService.getAllKoleksi(),
        ]);
        const item = tourRes.data || tourRes;
        setTour(item);
        setFormData({
          title: item.nama || item.title || '',
          description: item.deskripsi || item.description || '',
          lokasi_id: item.lokasi_id || '',
          urutan: item.urutan || 1,
          pitch: item.pitch || 0,
          yaw: item.yaw || 0,
          hfov: item.hfov || 100,
          image: null,
        });
        setLokasi(Array.isArray(lokasiRes) ? lokasiRes : (lokasiRes.data || []));
      } catch {
        Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: 'Terjadi kesalahan saat memuat data virtual tour', confirmButtonColor: '#059669' });
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lokasi_id) {
      await Swal.fire({ icon: 'warning', title: 'Lokasi Belum Dipilih', text: 'Silakan pilih lokasi terlebih dahulu', confirmButtonColor: '#16a34a' });
      return;
    }
    if (formData.image) {
      if (!['image/jpeg', 'image/png'].includes(formData.image.type)) {
        await Swal.fire({ icon: 'error', title: 'Format Tidak Didukung', text: 'Hanya file JPG dan PNG yang diizinkan.', confirmButtonColor: '#dc2626' });
        return;
      }
      if (formData.image.size > 50 * 1024 * 1024) {
        await Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: 'Ukuran file maksimal 50MB.', confirmButtonColor: '#dc2626' });
        return;
      }
    }
    setSubmitting(true);
    try {
      const response = await virtualTourService.updateTour(id, formData);
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: response.message || 'Virtual tour berhasil diupdate', confirmButtonColor: '#16a34a' });
      router.push('/pengelola/virtual');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Gagal menyimpan virtual tour', confirmButtonColor: '#dc2626' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="text-green-800 font-medium">Memuat data virtual tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.push('/pengelola/virtual')}
            className="flex items-center text-green-700 hover:text-green-800 mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Virtual Tour
          </button>
          <h1 className="text-3xl font-bold text-green-800">Edit Virtual Tour</h1>
          <p className="text-gray-600 mt-2">ID: <span className="font-semibold text-green-700">#{id}</span> · Perbarui informasi virtual tour 360°</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Dasar */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 bg-green-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">Informasi Dasar</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={formData.lokasi_id}
                  onChange={(e) => setFormData({ ...formData, lokasi_id: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none appearance-none bg-white"
                  required>
                  <option value="">-- Pilih Lokasi untuk Virtual Tour --</option>
                  {lokasi.map(loc => <option key={loc.id} value={loc.id}>{loc.nama}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Virtual Tour <span className="text-red-500">*</span></label>
              <input type="text" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                placeholder="Contoh: Pemandangan Taman Mawar dari Timur" maxLength={150} required />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Judul yang deskriptif membantu pengunjung memahami scene</p>
                <span className="text-xs text-gray-400">{formData.title.length}/150</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi <span className="text-red-500">*</span></label>
              <textarea value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                rows={6} placeholder="Deskripsikan scene ini secara detail..." maxLength={5000} required />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Maksimal 5000 karakter</p>
                <span className={`text-xs font-medium ${formData.description.length > 4500 ? 'text-red-500' : formData.description.length > 4000 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {formData.description.length}/5000
                </span>
              </div>
            </div>
          </div>

          {/* Pengaturan Kamera */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 bg-green-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">Pengaturan Kamera 360°</h3>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Pengaturan ini menentukan posisi awal kamera saat virtual tour dibuka.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Foto <span className="text-red-500">*</span></label>
              <input type="number" value={formData.urutan}
                onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                min="1" placeholder="1" required />
              <p className="text-xs text-gray-500 mt-1">Angka 1 = foto pertama (paling kiri), angka lebih besar = foto berikutnya (ke kanan).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pitch (Vertikal)</label>
                <input type="number" value={formData.pitch}
                  onChange={(e) => setFormData({ ...formData, pitch: parseFloat(e.target.value) || 0 })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  step="0.1" min="-90" max="90" />
                <p className="text-xs text-gray-500 mt-1">-90° (bawah) hingga 90° (atas)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Yaw (Horizontal)</label>
                <input type="number" value={formData.yaw}
                  onChange={(e) => setFormData({ ...formData, yaw: parseFloat(e.target.value) || 0 })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  step="0.1" min="-180" max="180" />
                <p className="text-xs text-gray-500 mt-1">-180° (kiri) hingga 180° (kanan)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">HFOV (Zoom)</label>
                <input type="number" value={formData.hfov}
                  onChange={(e) => setFormData({ ...formData, hfov: parseFloat(e.target.value) || 100 })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  step="1" min="30" max="120" />
                <p className="text-xs text-gray-500 mt-1">30° (zoom in) hingga 120° (zoom out)</p>
              </div>
            </div>
          </div>

          {/* Upload Gambar */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 bg-green-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">Gambar 360°</h3>
            </div>

            {tour?.image_path && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Gambar saat ini:</p>
                <img src={`${API_URL}${tour.image_path}`} alt={tour.nama}
                  className="w-40 h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg inline-block transition-colors text-sm font-medium">Pilih Gambar Baru</span>
                <input id="file-upload" type="file" accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (!['image/jpeg', 'image/png'].includes(file.type)) {
                      Swal.fire({ icon: 'error', title: 'Format Tidak Didukung', text: 'Hanya JPG dan PNG.', confirmButtonColor: '#dc2626' });
                      e.target.value = ''; return;
                    }
                    if (file.size > 50 * 1024 * 1024) {
                      Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: 'Maksimal 50MB.', confirmButtonColor: '#dc2626' });
                      e.target.value = ''; return;
                    }
                    setFormData({ ...formData, image: file });
                  }}
                  className="sr-only" />
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG hingga 50MB. Kosongkan jika tidak ingin mengubah gambar.</p>
            </div>
            {formData.image && (
              <p className="text-xs text-green-700 font-medium">✓ File terpilih: {formData.image.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => router.push('/pengelola/virtual')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Batal
            </button>
            <button type="submit" disabled={submitting || lokasi.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
              {submitting ? (
                <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Memperbarui...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Update Virtual Tour</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PengelolaEditVirtualTour() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <EditVirtualTourForm />
    </Suspense>
  );
}
