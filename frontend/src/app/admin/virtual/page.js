'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import api from '../../../../lib/api';
import { virtualTourService } from '../../../../lib/services/virtualTour';
import { koleksiService } from '../../../../lib/services/koleksi';

export default function AdminVirtualTourPage() {
  const [tours, setTours] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadTours();
    loadLokasi();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'tambah') router.push('/admin/virtual/tambah');
  }, [searchParams]);

  const loadLokasi = async () => {
    try {
      const data = await koleksiService.getAllKoleksi();
      const lokasiList = Array.isArray(data) ? data : (data.data || []);
      setLokasi(lokasiList);
    } catch (error) {
      console.error('Error loading lokasi:', error);
    }
  };

  const loadTours = async () => {
    try {
      const response = await api.get('/virtual-tour');
      const toursData = Array.isArray(response.data?.data) ? response.data.data : [];
      setTours(toursData);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.lokasi_id) {
      await Swal.fire({
        icon: 'warning',
        title: 'Lokasi Belum Dipilih',
        text: 'Silakan pilih lokasi terlebih dahulu',
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    if (formData.image) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 50 * 1024 * 1024;
      if (!allowedTypes.includes(formData.image.type)) {
        await Swal.fire({
          icon: 'error',
          title: 'Format File Tidak Didukung',
          text: 'Hanya file JPG dan PNG yang diizinkan.',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
      if (formData.image.size > maxSize) {
        await Swal.fire({
          icon: 'error',
          title: 'File Terlalu Besar',
          text: 'Ukuran file maksimal 50MB.',
          confirmButtonColor: '#dc2626'
        });
        return;
      }
    }
    
    try {
      if (editingTour) {
        console.log('Submitting update for tour ID:', editingTour.id);
        console.log('Form data being sent:', formData);
        
        const result = await virtualTourService.updateTour(editingTour.id, formData);
        console.log('Update result:', result);
        
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: result.message || 'Virtual tour berhasil diupdate!',
          confirmButtonColor: '#16a34a'
        });
      } else {
        console.log('Creating new tour with data:', formData);
        
        const result = await virtualTourService.createTour(formData);
        console.log('Create result:', result);
        
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: result.message || 'Virtual tour berhasil ditambahkan!',
          confirmButtonColor: '#16a34a'
        });
      }
      
      setShowForm(false);
      setEditingTour(null);
      setFormData({ title: '', description: '', lokasi_id: '', pitch: 0, yaw: 0, hfov: 100, image: null });
      await loadTours();
    } catch (error) {
      console.error('Error saving tour:', error);
      console.error('Error response:', error.response);
      
      // Extract detailed error message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Gagal menyimpan virtual tour';
      
      console.error('Displaying error message:', errorMessage);
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: errorMessage,
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleEdit = (tour) => {
    router.push(`/admin/virtual/edit?id=${tour.id}`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Virtual Tour?',
      text: 'Virtual tour yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/virtual-tour/${id}`);
        await loadTours();
        
        await Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Virtual tour berhasil dihapus',
          confirmButtonColor: '#16a34a'
        });
      } catch (error) {
        console.error('Error deleting tour:', error);
        
        await Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.response?.data?.message || 'Gagal menghapus virtual tour',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const getStatusBadge = (statusId) => {
    const statusMap = {
      1: { text: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-300' },
      2: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      3: { text: 'Published', color: 'bg-green-100 text-green-800 border-green-300' },
      4: { text: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' }
    };
    const status = statusMap[statusId] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${status.color}`}>
        {status.text}
      </span>
    );
  };

  const filteredTours = tours.filter(tour => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tour.status_id === 2;
    if (filter === 'published') return tour.status_id === 3;
    if (filter === 'rejected') return tour.status_id === 4;
    return true;
  });

  const stats = {
    total: tours.length,
    pending: tours.filter(t => t.status_id === 2).length,
    published: tours.filter(t => t.status_id === 3).length,
    rejected: tours.filter(t => t.status_id === 4).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data virtual tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Virtual Tour</h1>
            <p className="text-gray-600">Lihat dan kelola semua virtual tour</p>
          </div>
          <button
            onClick={() => router.push('/admin/virtual/tambah')}
            className="bg-[#16341B] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Virtual Tour
          </button>
        </div>
      </div>

      {/* Warning jika belum ada lokasi */}
      {lokasi.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-800">
                ⚠️ Belum ada lokasi tersedia. 
                <Link href="/admin/lokasi" className="font-medium underline ml-1">
                  Tambah lokasi terlebih dahulu
                </Link> sebelum membuat virtual tour.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal - REMOVED, now full page */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            
            {/* Sticky Header with Gradient */}
            <div className="sticky bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingTour ? 'Edit Virtual Tour' : 'Tambah Virtual Tour Baru'}
                  </h2>
                  <p className="text-green-100 text-sm mt-1">
                    {editingTour ? 'Perbarui informasi virtual tour 360°' : 'Buat pengalaman virtual tour 360° yang menarik'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingTour(null);
                  setFormData({ title: '', description: '', lokasi_id: '', pitch: 0, yaw: 0, hfov: 100, image: null });
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Tips Membuat Virtual Tour Berkualitas</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-600">
                        <li>Gunakan gambar 360° berkualitas tinggi dengan resolusi minimal 4096x2048</li>
                        <li>Pilih lokasi yang sesuai dengan scene virtual tour</li>
                        <li>Atur pitch, yaw, dan HFOV untuk initial view yang optimal</li>
                        <li>Berikan deskripsi yang jelas dan menarik untuk pengunjung</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section: Informasi Dasar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Informasi Dasar</h3>
                  </div>

                  {/* Lokasi */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Lokasi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.lokasi_id}
                        onChange={(e) => setFormData({...formData, lokasi_id: e.target.value})}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                        required
                      >
                        <option value="">-- Pilih Lokasi untuk Virtual Tour --</option>
                        {lokasi.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.nama} (ID: {loc.id})</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {lokasi.length === 0 ? (
                      <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                        <p className="text-xs text-red-700 flex items-center">
                          <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Belum ada lokasi tersedia. Tambahkan lokasi terlebih dahulu.
                        </p>
                      </div>
                    ) : formData.lokasi_id && (
                      <div className="mt-2 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                        <p className="text-xs text-green-700 flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Lokasi terpilih: <span className="font-medium ml-1">{lokasi.find(l => l.id === parseInt(formData.lokasi_id))?.nama}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Judul */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Judul Virtual Tour <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Contoh: Pemandangan Taman Mawar dari Timur"
                        maxLength={150}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Judul yang deskriptif membantu pengunjung memahami scene</p>
                      <span className="text-xs text-gray-400">{formData.title.length}/150</span>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Deskripsi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      rows="6"
                      placeholder="Deskripsikan scene ini... Apa yang menarik dari sudut pandang ini? Apa yang bisa dilihat pengunjung?"
                      maxLength={5000}
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Ceritakan detail menarik dari scene ini (maksimal 5000 karakter)</p>
                      <span className={`text-xs font-medium ${
                        formData.description.length > 4500 ? 'text-red-500' : 
                        formData.description.length > 4000 ? 'text-orange-500' : 
                        formData.description.length > 3000 ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {formData.description.length}/5000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Pengaturan Kamera 360° */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Pengaturan Kamera 360°</h3>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <svg className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>
                        <strong>Pengaturan ini menentukan posisi awal kamera saat virtual tour dibuka.</strong> 
                        Anda bisa mengatur pitch (atas/bawah), yaw (kiri/kanan), dan field of view untuk memberikan first impression terbaik.
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pitch */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                        </svg>
                        Pitch (Vertikal)
                      </label>
                      <input
                        type="number"
                        value={formData.pitch}
                        onChange={(e) => setFormData({...formData, pitch: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        step="0.1"
                        min="-90"
                        max="90"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Range: -90° (bawah) hingga 90° (atas)
                      </p>
                    </div>

                    {/* Yaw */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                        Yaw (Horizontal)
                      </label>
                      <input
                        type="number"
                        value={formData.yaw}
                        onChange={(e) => setFormData({...formData, yaw: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        step="0.1"
                        min="-180"
                        max="180"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Range: -180° (kiri) hingga 180° (kanan)
                      </p>
                    </div>

                    {/* HFOV */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        HFOV (Zoom)
                      </label>
                      <input
                        type="number"
                        value={formData.hfov}
                        onChange={(e) => setFormData({...formData, hfov: parseFloat(e.target.value) || 100})}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        step="1"
                        min="30"
                        max="120"
                        placeholder="100"
                      />
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Range: 30° (zoom in) hingga 120° (zoom out)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section: Upload Gambar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Gambar 360°</h3>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Upload Gambar 360° <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Pilih gambar atau drag & drop
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const allowedTypes = ['image/jpeg', 'image/png'];
                              if (!allowedTypes.includes(file.type)) {
                                Swal.fire({
                                  icon: 'error',
                                  title: 'Format File Tidak Didukung',
                                  text: 'Hanya file JPG dan PNG yang diizinkan.',
                                  confirmButtonColor: '#dc2626'
                                });
                                e.target.value = '';
                                return;
                              }
                              if (file.size > 50 * 1024 * 1024) {
                                Swal.fire({
                                  icon: 'error',
                                  title: 'File Terlalu Besar',
                                  text: 'Ukuran file maksimal 50MB.',
                                  confirmButtonColor: '#dc2626'
                                });
                                e.target.value = '';
                                return;
                              }
                              setFormData({...formData, image: file});
                            }}
                            className="sr-only"
                            required={!editingTour}
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG hingga 50MB
                        </p>
                      </div>
                    </div>
                    {formData.image && (
                      <div className="mt-2 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                        <p className="text-xs text-green-700 flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          File terpilih: <span className="font-medium ml-1">{formData.image.name}</span>
                        </p>
                      </div>
                    )}
                    {editingTour && !formData.image && (
                      <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                        <p className="text-xs text-blue-700 flex items-center">
                          <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Kosongkan jika tidak ingin mengubah gambar yang ada
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Rekomendasi Gambar 360°</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700 text-xs">
                          <li>Gunakan kamera 360° atau aplikasi untuk membuat foto equirectangular</li>
                          <li>Resolusi minimal: 4096 x 2048 pixels untuk kualitas optimal</li>
                          <li>Format: JPG atau PNG dengan kompresi yang seimbang</li>
                          <li>Pastikan pencahayaan merata dan tidak ada distorsi berlebihan</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning jika lokasi kosong */}
                {lokasi.length === 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <svg className="h-6 w-6 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-red-800">
                        <p className="font-bold mb-1">⚠️ Tidak dapat menyimpan virtual tour</p>
                        <p>Belum ada lokasi tersedia. Silakan tambahkan lokasi terlebih dahulu sebelum membuat virtual tour.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer - Action Buttons */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTour(null);
                    setFormData({ title: '', description: '', lokasi_id: '', pitch: 0, yaw: 0, hfov: 100, image: null });
                  }}
                  className="flex-1 inline-flex items-center justify-center bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={lokasi.length === 0}
                  className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {editingTour ? 'Update Virtual Tour' : 'Simpan Virtual Tour'}
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
            { key: 'pending', label: 'Pending Review', count: stats.pending },
            { key: 'published', label: 'Published', count: stats.published },
            { key: 'rejected', label: 'Rejected', count: stats.rejected }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                filter === tab.key
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white text-green-600' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredTours.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">Tidak ada virtual tour</p>
            <p className="text-gray-400 text-sm">Virtual tour akan muncul di sini setelah pengelola membuat</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Menampilkan <span className="font-semibold text-gray-700">{filteredTours.length}</span> virtual tour</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Virtual Tour</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTours.map((tour, index) => (
                    <tr key={tour.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tour.image_path ? (
                            <img src={`http://localhost:5001${tour.image_path}`} alt={tour.nama}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"
                            style={{ display: tour.image_path ? 'none' : 'flex' }}>
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{tour.nama || tour.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{tour.deskripsi || tour.description || 'Tidak ada deskripsi'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tour.lokasi_nama ? (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">{tour.lokasi_nama}</span>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(tour.status_id)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(tour.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleEdit(tour)}
                            className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">Edit</button>
                          {tour.status_id === 2 && (
                            <Link href="/admin/approval"
                              className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-lg transition-colors">Review</Link>
                          )}
                          <button onClick={() => handleDelete(tour.id)}
                            className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {stats.pending > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">⚠️ Ada <strong>{stats.pending}</strong> virtual tour menunggu review.
            <Link href="/admin/approval" className="ml-2 underline font-semibold">Review Sekarang →</Link>
          </p>
        </div>
      )}
    </div>
  );
}
