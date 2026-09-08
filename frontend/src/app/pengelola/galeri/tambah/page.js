'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { galeriService } from '@/lib/services/galeri';
import { koleksiService } from '@/lib/services/koleksi';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Swal from 'sweetalert2';

function TagsInput({ value, onChange }) {
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
  const [input, setInput] = useState('');

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed].join(','));
    }
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag).join(','));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 border-2 border-gray-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 min-h-[46px]">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-green-600 hover:text-green-900 leading-none">×</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? 'alam, flora, kebun...' : ''}
        className="flex-1 min-w-[120px] outline-none text-sm text-gray-700 bg-transparent"
      />
    </div>
  );
}

function TambahGaleriForm() {
  const router = useRouter();
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    lokasi_id: '',
    is_featured: false,
    urutan: 0,
    image: null,
    tags: '',
  });

  useEffect(() => {
    const loadLokasi = async () => {
      try {
        const response = await koleksiService.getAllKoleksi();
        setLokasiList(Array.isArray(response) ? response : (response.data || []));
      } catch { console.error('Error loading lokasi'); }
    };
    loadLokasi();
  }, []);

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
    setLoading(true);
    try {
      await galeriService.createGaleri(formData);
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Galeri berhasil ditambahkan', confirmButtonColor: '#16a34a' });
      router.push('/pengelola/galeri');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error.response?.data?.message || 'Terjadi kesalahan', confirmButtonColor: '#dc2626' });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-green-800">Tambah Galeri Baru</h1>
          <p className="text-gray-600 mt-2">Upload foto atau artikel tentang lokasi kebun raya</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Judul */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Judul <span className="text-red-500">*</span></label>
              <input type="text" value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                placeholder="Judul galeri / artikel" required />
            </div>

            {/* Deskripsi / Artikel */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi / Artikel</label>
              <RichTextEditor
                value={formData.deskripsi}
                onChange={(val) => setFormData({ ...formData, deskripsi: val })}
                placeholder="Tulis deskripsi atau artikel tentang lokasi ini..."
              />
              <p className="text-xs text-gray-400 mt-1">Gunakan toolbar untuk format teks dan sisipkan gambar</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <TagsInput value={formData.tags} onChange={(val) => setFormData({ ...formData, tags: val })} />
              <p className="text-xs text-gray-400 mt-1">Tekan Enter atau koma untuk menambah tag</p>
            </div>

            {/* Lokasi */}
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

            {/* Gambar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar Cover <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <label className="cursor-pointer">
                  <span className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-block transition-colors text-sm font-medium">Pilih Gambar</span>
                  <input type="file" accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="sr-only" required />
                </label>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP — Maks 50MB</p>
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
              <button type="submit" disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Menyimpan...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Simpan</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PengelolaTambahGaleri() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <TambahGaleriForm />
    </Suspense>
  );
}
