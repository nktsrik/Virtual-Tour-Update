'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { authService } from '../../../lib/services/auth';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!form.password) newErrors.password = 'Password wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuccess = (user) => {
    const roleName = user.role_name || user.role || 'visitor';
    let targetUrl = '/';
    if (roleName === 'admin') targetUrl = '/admin';
    else if (roleName === 'pengelola') targetUrl = '/pengelola';
    setSuccessMsg(`Selamat datang, ${user.nama}! Mengalihkan...`);
    setTimeout(() => { window.location.href = targetUrl; }, 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    setSuccessMsg(null);
    try {
      const response = await authService.login(form.email, form.password);
      if (!response || !response.success) throw new Error('Login gagal');
      const user = response.data?.user;
      if (!user) throw new Error('Data user tidak ditemukan');
      handleSuccess(user);
    } catch (err) {
      if (err?.response?.status === 401) {
        setErrors({ password: 'Email atau password salah. Silakan periksa kembali.' });
      } else if (err?.response?.status === 404) {
        setErrors({ email: 'Email tidak terdaftar.' });
      } else if (err?.response?.status === 403) {
        setErrors({ general: 'Akun Anda tidak memiliki akses. Hubungi administrator.' });
      } else if (err?.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Periksa koneksi internet Anda.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrors({});
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json());

        const response = await authService.loginWithGoogle(
          tokenResponse.access_token,
          userInfo.email,
          userInfo.name
        );

        if (!response.success) throw new Error('Login Google gagal');
        handleSuccess(response.data?.user);
      } catch (err) {
        setErrors({ general: err?.response?.data?.message || 'Login Google gagal. Coba lagi.' });
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErrors({ general: 'Login Google dibatalkan atau gagal.' })
  });

  return (
    <>
      <Navbar />

      <section className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center brightness-50" style={{ backgroundImage: "url('/CandiKR.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-transparent" />

        <div className="relative z-10 bg-[#0f4d1b] w-full max-w-md rounded-3xl p-10 shadow-2xl text-white">
          <div className="text-center mb-8">
            <img src="/karakter-bali.png" alt="Karakter Bali" className="w-32 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-1">Selamat Datang</h2>
            <p className="text-green-200 text-sm">Kebun Raya Bedugul</p>
          </div>

          <form onSubmit={handleLogin} noValidate>

            {/* Success message */}
            {successMsg && (
              <div className="mb-5 p-3 bg-green-500/20 border border-green-400/50 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-100 text-sm">{successMsg}</span>
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className="mb-5 p-3 bg-red-500/20 border border-red-400/50 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 text-red-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-100 text-sm">{errors.general}</span>
              </div>
            )}

            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm mb-2 font-medium">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email" type="email" name="email"
                  value={form.email} onChange={handleChange}
                  placeholder="contoh@email.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-2 border-red-500 focus:ring-red-400' : 'focus:ring-green-400'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-300 text-xs mt-2 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm mb-2 font-medium">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password" type="password" name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Masukkan kata sandi"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-2 border-red-500 focus:ring-red-400' : 'focus:ring-green-400'
                  }`}
                />
              </div>
              {errors.password && <p className="text-red-300 text-xs mt-2 ml-1">{errors.password}</p>}
            </div>

            <div className="text-right mb-6">
              <a href="/forgot-password" className="text-xs text-green-300 hover:text-green-200 transition-colors">
                Lupa Kata Sandi?
              </a>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#7ca94f] to-[#6b9344] hover:from-[#6b9344] hover:to-[#5a8233] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold mb-4 shadow-lg transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-xs text-gray-300">atau</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Tombol Google */}
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-3 rounded-xl mb-6 shadow transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>
          </form>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-300">
              Belum punya akun?{' '}
              <a href="/register" className="text-green-300 hover:text-green-200 font-semibold underline transition-colors">
                Daftar Sekarang
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
