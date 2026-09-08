'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import api from '../../../../lib/api';

export default function AdminAksesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'pengelola' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admin/users');
      setUsers(res.data.data || []);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat data pengguna', confirmButtonColor: '#dc2626' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleTambah = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!form.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';
    if (!form.password) newErrors.password = 'Password wajib diisi';
    else if (form.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      await api.post('/auth/admin/create-pengelola', {
        nama: form.nama,
        email: form.email,
        password: form.password,
      });
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pengguna berhasil ditambahkan', confirmButtonColor: '#16a34a' });
      setShowModal(false);
      setForm({ nama: '', email: '', password: '', role: 'pengelola' });
      setErrors({});
      loadUsers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err?.response?.data?.message || 'Gagal menambahkan pengguna', confirmButtonColor: '#dc2626' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const result = await Swal.fire({
      title: newStatus ? 'Aktifkan pengguna?' : 'Nonaktifkan pengguna?',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: newStatus ? '#16a34a' : '#d97706',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya', cancelButtonText: 'Batal'
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/auth/admin/users/${id}/status`, { is_active: newStatus });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengubah status', confirmButtonColor: '#dc2626' });
    }
  };

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: `Hapus ${nama}?`, text: 'Data yang dihapus tidak dapat dikembalikan',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/auth/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pengguna berhasil dihapus', confirmButtonColor: '#16a34a', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err?.response?.data?.message || 'Gagal menghapus pengguna', confirmButtonColor: '#dc2626' });
    }
  };

  const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    pengelola: users.filter(u => u.role === 'pengelola').length,
    visitor: users.filter(u => u.role === 'visitor').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin" className="text-green-600 hover:text-green-700 text-sm">← Kembali ke Dashboard</Link>
          <h1 className="text-3xl font-bold text-[#16341B] mt-1">Akses Pengguna</h1>
          <p className="text-gray-600">Kelola pengguna dan hak akses sistem</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErrors({}); setForm({ nama: '', email: '', password: '', role: 'pengelola' }); }}
          className="bg-[#16341B] text-white px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'bg-white' },
          { label: 'Admin', value: stats.admin, color: 'bg-red-50' },
          { label: 'Pengelola', value: stats.pengelola, color: 'bg-blue-50' },
          { label: 'Aktif', value: stats.active, color: 'bg-green-50' },
          { label: 'Tidak Aktif', value: stats.inactive, color: 'bg-gray-100' },
        ].map(s => (
          <div key={s.label} className={`${s.color} p-4 rounded-xl shadow`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: `Semua (${stats.total})` },
          { key: 'admin', label: `Admin (${stats.admin})` },
          { key: 'pengelola', label: `Pengelola (${stats.pengelola})` },
          { key: 'visitor', label: `Visitor (${stats.visitor})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterRole(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterRole === f.key ? 'bg-[#16341B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16341B] mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Menampilkan <span className="font-semibold text-gray-700">{filteredUsers.length}</span> pengguna</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pengguna</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Terdaftar</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#16341B] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{user.nama}</p>
                          <p className="text-xs text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'pengelola' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              user.is_active
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            }`}
                          >
                            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id, user.nama)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            Hapus
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Tambah Pengguna</h2>
                <p className="text-green-200 text-xs mt-0.5">Buat akun pengelola baru</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-green-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleTambah} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text" value={form.nama}
                  onChange={e => { setForm(f => ({ ...f, nama: e.target.value })); setErrors(p => ({ ...p, nama: '' })); }}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nama ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="contoh@email.com"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password" value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Minimal 6 karakter"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500">
                  Pengelola (hanya pengelola yang bisa dibuat)
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
