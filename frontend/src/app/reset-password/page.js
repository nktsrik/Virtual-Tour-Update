'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '../../../lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', konfirmasi: '' });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!token) setErrorMsg('Token tidak valid. Silakan minta link reset password baru.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) { setErrorMsg('Password wajib diisi'); return; }
    if (form.password.length < 6) { setErrorMsg('Password minimal 6 karakter'); return; }
    if (form.password !== form.konfirmasi) { setErrorMsg('Konfirmasi password tidak cocok'); return; }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/reset-password', { token, password: form.password });
      if (res.data.success) setSuccessMsg('Password berhasil direset! Silakan login dengan password baru.');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 bg-[#0f4d1b] w-full max-w-md rounded-3xl p-10 shadow-2xl text-white">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-white/10 rounded-full mb-4">
          <svg className="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-1">Reset Kata Sandi</h2>
        <p className="text-green-200 text-sm">Masukkan password baru Anda</p>
      </div>

      {successMsg ? (
        <div className="p-4 bg-green-500/20 border border-green-400/50 rounded-xl text-center">
          <svg className="w-12 h-12 text-green-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-100 text-sm">{successMsg}</p>
          <a href="/login" className="inline-block mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Login Sekarang
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {errorMsg && (
            <div className="mb-5 p-3 bg-red-500/20 border border-red-400/50 rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 text-red-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-100 text-sm">{errorMsg}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm mb-2 font-medium">Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Minimal 6 karakter"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2 font-medium">Konfirmasi Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                value={form.konfirmasi}
                onChange={e => setForm(f => ({ ...f, konfirmasi: e.target.value }))}
                placeholder="Ulangi password baru"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-gradient-to-r from-[#7ca94f] to-[#6b9344] hover:from-[#6b9344] hover:to-[#5a8233] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold mb-4 shadow-lg transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : 'Simpan Password Baru'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center brightness-50" style={{ backgroundImage: "url('/CandiKR.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-transparent" />
        <Suspense fallback={<div className="text-white">Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </>
  );
}
