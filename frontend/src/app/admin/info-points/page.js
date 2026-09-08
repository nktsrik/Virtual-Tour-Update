'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminInfoPointsPage() {
  const [infoPoints, setInfoPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [filterType, setFilterType] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      // Load info points
      const infoResponse = await fetch('http://localhost:5000/api/info-point', {
        credentials: 'include'
      });
      const infoResult = await infoResponse.json();
      if (infoResult.success) {
        setInfoPoints(infoResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Gagal memuat data info point', 'error');
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
    if (!confirm('Apakah Anda yakin ingin menghapus info point ini?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/info-point/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        showAlert('Info point berhasil dihapus', 'success');
        loadData();
      } else {
        showAlert(result.message || 'Gagal menghapus info point', 'error');
      }
    } catch (error) {
      console.error('Error deleting info point:', error);
      showAlert('Terjadi kesalahan saat menghapus info point', 'error');
    }
  };

  const filteredInfoPoints = filterType === 'all' 
    ? infoPoints 
    : infoPoints.filter(point => point.type === filterType);

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'text':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'audio':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const typeStats = {
    text: infoPoints.filter(p => p.type === 'text').length,
    image: infoPoints.filter(p => p.type === 'image').length,
    video: infoPoints.filter(p => p.type === 'video').length,
    audio: infoPoints.filter(p => p.type === 'audio').length,
  };

  return (
    <div>
      {/* Alert */}
      {alert.show && (
        <div className={`mb-4 p-4 rounded-lg ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' : 
          alert.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin" className="text-green-600 hover:text-green-700 text-sm">
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#16341B] mt-1">Kelola Info Points</h1>
          <p className="text-gray-600">Tambah informasi detail pada virtual tour</p>
        </div>
        <button
          onClick={() => showAlert('Fitur tambah info point dalam pengembangan', 'info')}
          className="bg-[#16341B] text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          + Tambah Info Point
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Tentang Info Points</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Info Point adalah titik informasi interaktif yang memberikan detail tambahan pada virtual tour. Dapat berupa teks, gambar, video, atau audio.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Info Points</div>
          <div className="text-2xl font-bold text-[#16341B]">{infoPoints.length}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <div className="text-sm text-blue-600">Text</div>
          <div className="text-2xl font-bold text-blue-700">{typeStats.text}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-sm text-green-600">Image</div>
          <div className="text-2xl font-bold text-green-700">{typeStats.image}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <div className="text-sm text-purple-600">Video</div>
          <div className="text-2xl font-bold text-purple-700">{typeStats.video}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-sm text-yellow-600">Audio</div>
          <div className="text-2xl font-bold text-yellow-700">{typeStats.audio}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'all' 
              ? 'bg-[#16341B] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semua ({infoPoints.length})
        </button>
        <button
          onClick={() => setFilterType('text')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'text' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          Text ({typeStats.text})
        </button>
        <button
          onClick={() => setFilterType('image')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'image' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Image ({typeStats.image})
        </button>
        <button
          onClick={() => setFilterType('video')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'video' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          Video ({typeStats.video})
        </button>
        <button
          onClick={() => setFilterType('audio')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'audio' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          Audio ({typeStats.audio})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16341B] mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Memuat data...</div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Point</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Virtual Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInfoPoints.length > 0 ? (
                filteredInfoPoints.map((point) => (
                  <tr key={point.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{point.title || 'Untitled Info Point'}</div>
                      <div className="text-sm text-gray-500">{point.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{point.virtual_tour_title || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeBadgeColor(point.type)}`}>
                        {point.type || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        {point.position_x && point.position_y ? (
                          <>
                            <div>X: {point.position_x}</div>
                            <div>Y: {point.position_y}</div>
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          onClick={() => showAlert('Fitur edit dalam pengembangan', 'info')}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDelete(point.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-lg font-medium mb-2">
                        {filterType === 'all' ? 'Belum ada info point' : `Belum ada info point dengan tipe ${filterType}`}
                      </div>
                      <div className="text-sm mb-4">
                        {filterType === 'all' 
                          ? 'Mulai dengan menambahkan info point pertama Anda' 
                          : 'Coba filter lain atau tambahkan info point baru'}
                      </div>
                      <button
                        onClick={() => showAlert('Fitur tambah info point dalam pengembangan', 'info')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Tambah Info Point
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
