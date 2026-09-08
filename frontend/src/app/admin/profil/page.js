'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { authService } from '../../../../lib/services/auth';
import api from '../../../../lib/api';

export default function ProfilAdminPage() {
  const [profile, setProfile] = useState({ 
    nama: '', 
    email: '',
    telepon: '',
    role_name: '',
    created_at: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data || response;
      const profileData = {
        nama: userData.nama || '',
        email: userData.email || '',
        telepon: userData.telepon || '',
        role_name: userData.role_name || 'Admin',
        created_at: userData.created_at || ''
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (err) {
      console.error('Gagal fetch profile:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Profil',
        text: 'Tidak dapat memuat data profil. Silakan refresh halaman.',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Check if there are changes
    if (profile.nama === originalProfile.nama && profile.email === originalProfile.email && profile.telepon === originalProfile.telepon) {
      await Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Perubahan',
        text: 'Tidak ada data yang diubah.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    
    setUpdating(true);
    
    try {
      await api.put('/auth/profile', {
        nama: profile.nama,
        telepon: profile.telepon,
      });
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui!',
        confirmButtonColor: '#16a34a',
        timer: 2000
      });
      
      // Refresh profile data
      await fetchProfile();
      setEditMode(false);
    } catch (err) {
      console.error('Gagal update profile:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.message || 'Gagal memperbarui profil',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditMode(false);
  };

  const handleChangePassword = () => {
    Swal.fire({
      icon: 'info',
      title: 'Ubah Password',
      html: `
        <p class="text-gray-600 mb-4">Untuk mengubah password, silakan hubungi administrator sistem.</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p class="text-sm text-blue-800">
            <strong>Alasan:</strong><br/>
            Perubahan password memerlukan verifikasi keamanan tambahan yang hanya dapat dilakukan oleh administrator.
          </p>
        </div>
      `,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Mengerti'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Avatar */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profil Saya</h1>
          <p className="text-gray-600">Kelola informasi profil dan pengaturan akun Anda</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg mb-4">
                  <span className="text-3xl font-bold text-white">
                    {profile.nama ? profile.nama.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.nama || 'Admin'}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {profile.role_name}
                </span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="truncate">{profile.email}</span>
                </div>
                {profile.created_at && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Aksi Cepat</h4>
              <div className="space-y-2">
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-gray-600 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Ubah Password</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips Keamanan</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Gunakan password yang kuat</li>
                    <li>• Jangan bagikan akun Anda</li>
                    <li>• Logout setelah selesai</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Informasi Profil</h2>
                    <p className="text-blue-100 text-sm">Perbarui informasi pribadi Anda</p>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all flex items-center gap-2 font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Profil
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <form onSubmit={handleUpdate} className="p-8">
                <div className="space-y-6">
                  
                  {/* Nama Field */}
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Nama Lengkap
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 border rounded-xl transition-all font-medium text-gray-900 ${editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                      placeholder="Masukkan nama lengkap"
                      value={profile.nama}
                      onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                      disabled={!editMode}
                      required
                    />
                  </div>

                  {/* Email Field — read only */}
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Alamat Email
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">Tidak dapat diubah</span>
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 cursor-not-allowed font-medium"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  {/* Telepon Field */}
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      className={`w-full px-4 py-3 border rounded-xl transition-all font-medium text-gray-900 ${editMode ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                      placeholder={editMode ? 'Contoh: 08123456789' : '-'}
                      value={profile.telepon}
                      onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Role Akun
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">Tidak dapat diubah</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
                      value={profile.role_name}
                      disabled
                    />
                  </div>

                  {/* Created At (Read-only) */}
                  {profile.created_at && (
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Tanggal Bergabung
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
                        value={new Date(profile.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        disabled
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  {editMode && (
                    <div className="pt-6 flex gap-3 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {updating ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menyimpan...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Simpan Perubahan
                          </span>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={updating}
                        className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
