'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setErrorMsg('Email wajib diisi'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrorMsg('Format email tidak valid'); return; }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccessMsg('Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center brightness-50" style={{ backgroundImage: "url('/CandiKR.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-transparent" />

        <div className="relative z-10 bg-[#0f4d1b] w-full max-w-md rounded-3xl p-10 shadow-2xl text-white">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-white/10 rounded-full mb-4">
              <svg className="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-1">Lupa Kata Sandi</h2>
            <p className="text-green-200 text-sm">Masukkan email untuk menerima link reset</p>
          </div>

          {successMsg ? (
            <div className="p-4 bg-green-500/20 border border-green-400/50 rounded-xl text-center">
              <svg className="w-12 h-12 text-green-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-green-100 text-sm">{successMsg}</p>
              <a href="/login" className="inline-block mt-4 text-green-300 hover:text-green-200 text-sm underline">
                Kembali ke Login
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

              <div className="mb-6">
                <label className="block text-sm mb-2 font-medium">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(null); }}
                    placeholder="contoh@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#7ca94f] to-[#6b9344] hover:from-[#6b9344] hover:to-[#5a8233] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold mb-4 shadow-lg transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengirim...
                  </>
                ) : 'Kirim Link Reset Password'}
              </button>

              <div className="text-center">
                <a href="/login" className="text-green-300 hover:text-green-200 text-sm underline transition-colors">
                  Kembali ke Login
                </a>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
