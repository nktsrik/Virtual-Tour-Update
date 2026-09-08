'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Alert } from '../../../../components/UIComponents';

export default function AdminHotspotsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [virtualTours, setVirtualTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [filterTour, setFilterTour] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load virtual tours for dropdown
      const toursResponse = await fetch('http://localhost:5001/api/virtual-tour', {
        credentials: 'include'
      });
      const toursResult = await toursResponse.json();
      if (toursResult.success) {
        setVirtualTours(toursResult.data || []);
      }

      // Load hotspots
      const hotspotsResponse = await fetch('http://localhost:5001/api/hotspot', {
        credentials: 'include'
      });
      const hotspotsResult = await hotspotsResponse.json();
      if (hotspotsResult.success) {
        setHotspots(hotspotsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Gagal memuat data hotspot', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus hotspot ini?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/hotspot/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        showAlert('Hotspot berhasil dihapus', 'success');
        loadData();
      } else {
        showAlert(result.message || 'Gagal menghapus hotspot', 'error');
      }
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      showAlert('Terjadi kesalahan saat menghapus hotspot', 'error');
    }
  };

  // Filter & Search
  const filteredHotspots = hotspots.filter(h => {
    const matchesTour = filterTour === 'all' || h.source_tour_id === parseInt(filterTour);
    const matchesSearch = !searchQuery || 
      h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTour && matchesSearch;
  });

  // Stats
  const stats = {
    total: hotspots.length,
    sourceTours: new Set(hotspots.map(h => h.source_tour_id)).size,
    targetTours: new Set(hotspots.map(h => h.target_tour_id)).size,
    activeTours: virtualTours.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Alert */}
      {alert.show && (
        <Alert type={alert.type} message={alert.message} />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-xl border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
            <div className="text-white">
              <Link href="/admin" className="text-green-100 hover:text-white text-sm mb-2 inline-flex items-center transition-colors">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Kembali ke Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Kelola Hotspots</h1>
                  <p className="text-green-100 text-sm">Tambah navigasi antar virtual tour</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center bg-white text-green-700 px-6 py-3 rounded-lg hover:bg-green-50 transition-all shadow-lg font-medium transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Hotspot
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Hotspots</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Tour Sumber</p>
                <p className="text-3xl font-bold">{stats.sourceTours}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Tour Tujuan</p>
                <p className="text-3xl font-bold">{stats.targetTours}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">VR Tersedia</p>
                <p className="text-3xl font-bold">{stats.activeTours}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Hotspot</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filter by Tour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Virtual Tour</label>
              <select
                value={filterTour}
                onChange={(e) => setFilterTour(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="all">Semua Tour ({hotspots.length})</option>
                {virtualTours.map(tour => (
                  <option key={tour.id} value={tour.id}>
                    {tour.nama || tour.title} ({hotspots.filter(h => h.source_tour_id === tour.id).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hotspots List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Memuat data hotspots...</p>
            </div>
          </div>
        ) : filteredHotspots.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredHotspots.map((hotspot) => (
              <div key={hotspot.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{hotspot.title || 'Untitled Hotspot'}</h3>
                          <p className="text-sm text-gray-500">{hotspot.description || 'Tidak ada deskripsi'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Source Tour */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            <span className="text-xs font-semibold text-blue-700 uppercase">Dari Tour</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{hotspot.source_tour_title || 'N/A'}</p>
                        </div>

                        {/* Target Tour */}
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold text-purple-700 uppercase">Ke Tour</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{hotspot.target_tour_title || 'N/A'}</p>
                        </div>

                        {/* Position */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700 uppercase">Posisi</span>
                          </div>
                          {hotspot.position_x && hotspot.position_y ? (
                            <div className="text-xs text-gray-600">
                              <div>X: {hotspot.position_x}</div>
                              <div>Y: {hotspot.position_y}</div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Belum diatur</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => showAlert('Fitur edit dalam pengembangan', 'info')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(hotspot.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center text-center">
              <div className="p-6 bg-gray-100 rounded-full mb-6">
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery || filterTour !== 'all' ? 'Tidak ada hotspot ditemukan' : 'Belum ada hotspot'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                {searchQuery || filterTour !== 'all' 
                  ? 'Coba ubah filter atau kata kunci pencarian Anda'
                  : 'Mulai dengan menambahkan hotspot pertama untuk menghubungkan antar virtual tour'
                }
              </p>
              {(!searchQuery && filterTour === 'all') && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-medium transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Tambah Hotspot Pertama
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">Tambah Hotspot</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Fitur dalam pengembangan.</strong> Form tambah hotspot akan segera tersedia.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
