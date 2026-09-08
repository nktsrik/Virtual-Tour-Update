'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { koleksiService } from '@/lib/services/koleksi';
import { virtualTourService } from '@/lib/services/virtualTour';

export default function TambahVirtualTour() {
  const router = useRouter();
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(false);
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
    const loadLokasi = async () => {
      try {
        const data = await koleksiService.getAllKoleksi();
        setLokasi(Array.isArray(data) ? data : (data.data || []));
      } catch {
        console.error('Gagal memuat lokasi');
      }
    };
    loadLokasi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lokasi_id) {
      Swal.fire({ icon: 'warning', title: 'Lokasi Belum Dipilih', text: 'Silakan pilih lokasi terlebih dahulu', confirmButtonColor: '#16a34a' });
      return;
    }

    if (formData.image) {
      if (!['image/jpeg', 'image/png'].includes(formData.image.type)) {
        Swal.fire({ icon: 'error', title: 'Format Tidak Didukung', text: 'Hanya file JPG dan PNG yang diizinkan.', confirmButtonColor: '#dc2626' });
        return;
      }
      if (formData.image.size > 50 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: 'Ukuran file maksimal 50MB.', confirmButtonColor: '#dc2626' });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await virtualTourService.createTour(formData);
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: response.message || 'Virtual tour berhasil ditambahkan. Status: Draft', confirmButtonColor: '#16a34a' });
      router.push('/pengelola/virtual');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Gagal menyimpan virtual tour', confirmButtonColor: '#dc2626' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-full bg-white">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push('/pengelola/virtual')}
          className="flex items-center text-green-700 hover:text-green-800 mb-4 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Daftar Virtual Tour
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Tambah Virtual Tour Baru</h1>
        <p className="text-gray-600 mt-1">Buat pengalaman virtual tour 360° yang menarik</p>
      </div>

      {lokasi.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-yellow-800 text-sm">Belum ada lokasi tersedia. Hubungi admin untuk menambahkan lokasi terlebih dahulu.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Tips Membuat Virtual Tour Berkualitas</p>
              <ul className="list-disc list-inside space-y-1 text-blue-600 text-xs">
                <li>Gunakan gambar 360° berkualitas tinggi dengan resolusi minimal 4096x2048</li>
                <li>Pilih lokasi yang sesuai dengan scene virtual tour</li>
                <li>Atur pitch, yaw, dan HFOV untuk initial view yang optimal</li>
                <li>Berikan deskripsi yang jelas dan menarik untuk pengunjung</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section: Informasi Dasar */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">Informasi Dasar</h3>
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={formData.lokasi_id} onChange={(e) => setFormData({...formData, lokasi_id: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                required>
                <option value="">-- Pilih Lokasi untuk Virtual Tour --</option>
                {lokasi.map(loc => <option key={loc.id} value={loc.id}>{loc.nama}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {formData.lokasi_id && (
              <p className="text-xs text-green-700 mt-1">✓ Lokasi terpilih: <span className="font-medium">{lokasi.find(l => l.id === parseInt(formData.lokasi_id))?.nama}</span></p>
            )}
          </div>

          {/* Judul */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Virtual Tour <span className="text-red-500">*</span></label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Contoh: Pemandangan Taman Mawar dari Timur" maxLength={150} required />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Judul yang deskriptif membantu pengunjung memahami scene</p>
              <span className="text-xs text-gray-400">{formData.title.length}/150</span>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi <span className="text-red-500">*</span></label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              rows={6} placeholder="Deskripsikan scene ini secara detail..." maxLength={5000} required />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Maksimal 5000 karakter</p>
              <span className={`text-xs font-medium ${formData.description.length > 4500 ? 'text-red-500' : formData.description.length > 4000 ? 'text-orange-500' : 'text-gray-400'}`}>
                {formData.description.length}/5000
              </span>
            </div>
          </div>
        </div>

        {/* Section: Pengaturan Kamera */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">Pengaturan Kamera 360°</h3>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pengaturan ini menentukan posisi awal kamera saat virtual tour dibuka. Atur untuk memberikan <strong>first impression</strong> terbaik.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Foto <span className="text-red-500">*</span></label>
            <input type="number" value={formData.urutan}
              onChange={(e) => setFormData({...formData, urutan: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              min="1" placeholder="1" required />
            <p className="text-xs text-gray-500 mt-1">Angka 1 = foto pertama (paling kiri), angka lebih besar = foto berikutnya (ke kanan).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pitch (Vertikal)</label>
              <input type="number" value={formData.pitch} onChange={(e) => setFormData({...formData, pitch: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                step="0.1" min="-90" max="90" placeholder="0" />
              <p className="text-xs text-gray-500 mt-1">-90° (bawah) hingga 90° (atas)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Yaw (Horizontal)</label>
              <input type="number" value={formData.yaw} onChange={(e) => setFormData({...formData, yaw: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                step="0.1" min="-180" max="180" placeholder="0" />
              <p className="text-xs text-gray-500 mt-1">-180° (kiri) hingga 180° (kanan)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">HFOV (Zoom)</label>
              <input type="number" value={formData.hfov} onChange={(e) => setFormData({...formData, hfov: parseFloat(e.target.value) || 100})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                step="1" min="30" max="120" placeholder="100" />
              <p className="text-xs text-gray-500 mt-1">30° (zoom in) hingga 120° (zoom out)</p>
            </div>
          </div>
        </div>

        {/* Section: Upload Gambar */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">Gambar 360°</h3>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-block transition-colors text-sm font-medium">Pilih Gambar 360°</span>
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
                  setFormData({...formData, image: file});
                }}
                className="sr-only" required />
            </label>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG hingga 50MB</p>
          </div>

          {formData.image && (
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <p className="text-xs text-green-700">✓ File terpilih: <span className="font-medium">{formData.image.name}</span> ({(formData.image.size / 1024 / 1024).toFixed(1)} MB)</p>
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-sm font-medium text-yellow-800 mb-1">Rekomendasi Gambar 360°</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700 text-xs">
              <li>Gunakan kamera 360° atau aplikasi untuk membuat foto equirectangular</li>
              <li>Resolusi minimal: 4096 x 2048 pixels untuk kualitas optimal</li>
              <li>Pastikan pencahayaan merata dan tidak ada distorsi berlebihan</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/pengelola/virtual')}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium">
            Batal
          </button>
          <button type="submit" disabled={loading || lokasi.length === 0}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Menyimpan...</>
            ) : (
              <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Simpan Virtual Tour</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
