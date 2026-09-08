'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ProfilPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ nama: '', telepon: '' });

  useEffect(() => {
    const token = Cookies.get('token');
    const userDataStr = Cookies.get('user');
    if (!token || !userDataStr) { router.push('/login'); return; }

    try {
      const user = JSON.parse(userDataStr);
      const role = user.role_name || user.role || 'visitor';
      if (role !== 'visitor') { router.push('/'); return; }

      // Fetch profil terbaru dari API
      fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            const u = res.data;
            setUserData(u);
            setFormData({ nama: u.nama || '', telepon: u.telepon || '' });
          } else {
            // Fallback ke cookie
            setUserData(user);
            setFormData({ nama: user.nama || '', telepon: user.telepon || '' });
          }
        })
        .catch(() => {
          setUserData(user);
          setFormData({ nama: user.nama || '', telepon: user.telepon || '' });
        })
        .finally(() => setIsLoading(false));
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nama wajib diisi', confirmButtonColor: '#7ca94f' });
      return;
    }
    setSubmitting(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nama: formData.nama.trim(), telepon: formData.telepon.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal memperbarui profil');

      // Update cookie dengan data terbaru
      const updatedUser = { ...userData, nama: result.data.nama, telepon: result.data.telepon };
      Cookies.set('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setIsEditing(false);

      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Profil berhasil diperbarui', confirmButtonColor: '#7ca94f', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, confirmButtonColor: '#dc2626' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ nama: userData?.nama || '', telepon: userData?.telepon || '' });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-lg mx-auto px-4">

          {/* Header card */}
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 mb-4 flex items-center gap-4 shadow">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-green-700 flex-shrink-0">
              {userData?.nama?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{userData?.nama}</h2>
              <p className="text-green-100 text-sm">{userData?.email}</p>
              <span className="mt-1 inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Visitor</span>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Informasi Profil</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email — read only */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input type="email" value={userData?.email || ''} disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm" />
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors text-gray-800 ${
                    isEditing
                      ? 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`} />
              </div>

              {/* Telepon */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">No. Telepon</label>
                <input type="tel" name="telepon" value={formData.telepon} onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={isEditing ? 'Contoh: 08123456789' : '-'}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors text-gray-800 ${
                    isEditing
                      ? 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`} />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors">
                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button type="button" onClick={handleCancel} disabled={submitting}
                    className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                    Batal
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
