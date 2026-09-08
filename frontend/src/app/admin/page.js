'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import Cookies from 'js-cookie';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalTours: 0, pendingReview: 0, totalLokasi: 0, totalGaleri: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  const statusLabel = { 1: 'Draft', 2: 'Pending Review', 3: 'Published', 4: 'Rejected', 5: 'Perlu Revisi' };
  const statusStyle = {
    1: { dot: 'bg-gray-400', text: 'text-gray-500' },
    2: { dot: 'bg-yellow-500', text: 'text-yellow-600' },
    3: { dot: 'bg-emerald-500', text: 'text-emerald-600' },
    4: { dot: 'bg-red-500', text: 'text-red-600' },
    5: { dot: 'bg-orange-500', text: 'text-orange-600' },
  };

  useEffect(() => {
    try {
      const u = Cookies.get('user');
      if (u) setUser(JSON.parse(u));
    } catch {}
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [toursRes, lokasiRes, galeriRes] = await Promise.allSettled([
        api.get('/virtual-tour'),
        api.get('/lokasi'),
        api.get('/galeri'),
      ]);
      const tours = toursRes.status === 'fulfilled' ? (toursRes.value.data?.data || []) : [];
      const lokasi = lokasiRes.status === 'fulfilled' ? (lokasiRes.value.data?.data || []) : [];
      const galeri = galeriRes.status === 'fulfilled' ? (galeriRes.value.data?.data || []) : [];

      const acts = [
        ...tours.map(t => ({ title: t.nama || t.title, type: 'Virtual Tour', status: t.status_id, time: formatTime(t.updated_at || t.created_at), date: new Date(t.updated_at || t.created_at) })),
        ...galeri.map(g => ({ title: g.judul, type: 'Galeri', status: g.status_id, time: formatTime(g.updated_at || g.created_at), date: new Date(g.updated_at || g.created_at) })),
      ].sort((a, b) => b.date - a.date).slice(0, 8);

      setActivities(acts);
      setStats({ totalTours: tours.length, pendingReview: tours.filter(t => t.status_id === 2).length, totalLokasi: lokasi.length, totalGaleri: galeri.length });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const statCards = [
    { label: 'Total Lokasi', value: stats.totalLokasi, sub: 'Lokasi terdaftar' },
    { label: 'Virtual Tour', value: stats.totalTours, sub: 'Panorama 360°' },
    { label: 'Total Galeri', value: stats.totalGaleri, sub: 'Foto & media' },
    { label: 'Pending Review', value: stats.pendingReview, sub: 'Menunggu approval', highlight: stats.pendingReview > 0 },
  ];

  const quickActions = [
    { label: 'Tambah Virtual Tour', sub: 'Upload panorama 360°', href: '/admin/virtual?action=tambah', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /> },
    { label: 'Tambah Galeri', sub: 'Upload foto & media', href: '/admin/galeri', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { label: 'Tambah Lokasi', sub: 'Tambah titik lokasi baru', href: '/admin/lokasi?action=tambah', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { label: 'Approval VR', sub: `${stats.pendingReview} menunggu review`, href: '/admin/approval', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, badge: stats.pendingReview > 0 },
    { label: 'Kelola Pengguna', sub: 'Atur akses & role', href: '/admin/akses', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { label: 'Preview Tour', sub: 'Lihat tampilan publik', href: '/virtual-tour', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> },
  ];

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#f9fafb]">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-400">{greeting()}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">Dashboard Administrator</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-[#16341B] flex items-center justify-center text-white font-semibold text-sm">
          {user?.nama || 'Admin'}
        </div>
      </div>

      {/* Pending Alert */}
      {stats.pendingReview > 0 && (
        <div className="bg-white border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-2 h-10 bg-yellow-400 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{stats.pendingReview} virtual tour menunggu review</p>
            <p className="text-xs text-gray-400 mt-0.5">Lakukan approval agar konten dapat dipublikasikan</p>
          </div>
          <Link href="/admin/approval" className="text-sm font-medium text-[#16341B] hover:underline flex-shrink-0">
            Lihat →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-5 border ${s.highlight ? 'border-yellow-200' : 'border-gray-100'}`}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.highlight ? 'text-yellow-600' : 'text-gray-900'}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main: 2 kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Aktivitas Terbaru</h3>
            <span className="text-xs text-gray-400">{activities.length} item</span>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#16341B]" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Belum ada aktivitas</div>
            ) : activities.map((act, i) => {
              const s = statusStyle[act.status] || statusStyle[1];
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{act.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.type} · <span className={s.text}>{statusLabel[act.status] || 'Draft'}</span></p>
                  </div>
                  <span className="text-xs text-gray-300 flex-shrink-0">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Aksi Cepat</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#16341B] flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">{a.icon}</svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{a.label}</p>
                  <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                </div>
                {a.badge && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                )}
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
