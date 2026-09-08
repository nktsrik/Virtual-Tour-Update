'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { galeriService } from '@/lib/services/galeri';
import { koleksiService } from '@/lib/services/koleksi';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function EditGaleriForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [galeri, setGaleri] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    lokasi_id: '',
    is_featured: false,
    urutan: 0,
    image: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [galeriRes, lokasiRes] = await Promise.all([
          galeriService.getGaleriById(id),
          koleksiService.getAllKoleksi(),
        ]);
        const item = galeriRes.data || galeriRes;
        setGaleri(item);
        setFormData({
          judul: item.judul || '',
          deskripsi: item.deskripsi || '',
          lokasi_id: item.lokasi_id || '',
          is_featured: item.is_featured || false,
          urutan: item.urutan || 0,
          image: null,
        });
        const lokasiData = Array.isArray(lokasiRes) ? lokasiRes : (lokasiRes.data || []);
        setLokasiList(lokasiData);
      } catch {
        Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: 'Terjadi kesalahan saat memuat data galeri', confirmButtonColor: '#059669' });
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.image) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(formData.image.type)) {
        await Swal.fire({ icon: 'error', title: 'Format Tidak Didukung', text: 'Hanya JPG, PNG, atau WEBP', confirmButtonColor: '#dc2626' });
        return;
      }
      if (formData.image.size > 50 * 1024 * 1024) {
        await Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: 'Maksimal 50MB', confirmButtonColor: '#dc2626' });
        return;
      }
    }
    setSubmitting(true);
    try {
      await galeriService.updateGaleri(id, formData);
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri berhasil diupdate', confirmButtonColor: '#16a34a' });
      router.push('/pengelola/galeri');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
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
          <p className="text-green-800 font-medium">Memuat data galeri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.push('/pengelola/galeri')}
            className="flex items-center text-green-700 hover:text-green-800 mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Galeri
          </button>
          <h1 className="text-3xl font-bold text-green-800">Edit Galeri</h1>
          <p className="text-gray-600 mt-2">ID: <span className="font-semibold text-green-700">#{id}</span> · Perbarui informasi galeri</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul <span className="text-red-500">*</span></label>
              <input type="text" value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
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
              <div className="relative">
                <select value={formData.lokasi_id}
                  onChange={(e) => setFormData({ ...formData, lokasi_id: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none appearance-none bg-white">
                  <option value="">-- Pilih Lokasi --</option>
                  {lokasiList.map((loc) => <option key={loc.id} value={loc.id}>{loc.nama}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ganti Gambar <span className="text-gray-400">(Opsional)</span></label>
              {galeri?.file_path && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Gambar saat ini:</p>
                  <img src={`${API_URL}${galeri.file_path}`} alt={galeri.judul}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <label className="cursor-pointer">
                  <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg inline-block transition-colors text-sm font-medium">Pilih Gambar Baru</span>
                  <input type="file" accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="sr-only" />
                </label>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP — Maks 50MB. Kosongkan jika tidak ingin mengubah gambar.</p>
              </div>
              {formData.image && (
                <p className="text-xs text-green-700 mt-2 font-medium">✓ {formData.image.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Tampil</label>
                <input type="number" value={formData.urutan}
                  onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  min="0" />
              </div>
              <div className="flex items-center gap-2 mt-8">
                <input type="checkbox" id="is_featured" checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Tampilkan sebagai Unggulan</label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={() => router.push('/pengelola/galeri')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Batal
              </button>
              <button type="submit" disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
                {submitting ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Memperbarui...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Update Galeri</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PengelolaEditGaleri() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <EditGaleriForm />
    </Suspense>
  );
}
