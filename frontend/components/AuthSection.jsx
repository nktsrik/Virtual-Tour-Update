"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Swal from 'sweetalert2';
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '../lib/services/auth';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AuthSection() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
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

      const user = response.data?.user;
      const roleName = user?.role_name || user?.role || 'visitor';
      let targetUrl = '/';
      if (roleName === 'admin') targetUrl = '/admin';
      else if (roleName === 'pengelola') targetUrl = '/pengelola';

      await Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: `Selamat datang, ${user?.nama}!`,
        confirmButtonColor: '#7ca94f',
        timer: 1500,
        showConfirmButton: false,
      });
      router.push(targetUrl);
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Login Google Gagal!',
        text: err?.response?.data?.message || 'Terjadi kesalahan. Coba lagi.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => Swal.fire({ icon: 'error', title: 'Gagal', text: 'Login Google dibatalkan.', confirmButtonColor: '#dc2626' })
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nama.trim()) {
      newErrors.nama = 'Nama pengguna wajib diisi';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!form.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        // Tampilkan SweetAlert success
        await Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil!',
          text: 'Akun Anda telah dibuat. Silakan login untuk melanjutkan.',
          confirmButtonColor: '#7ca94f',
          confirmButtonText: 'Login Sekarang',
        });
        router.push("/login");
      } else {
        // Tampilkan SweetAlert error
        await Swal.fire({
          icon: 'error',
          title: 'Registrasi Gagal!',
          text: data.message || 'Terjadi kesalahan saat mendaftar.',
          confirmButtonColor: '#dc2626',
        });
        setErrors({ general: data.message || 'Registrasi gagal' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Tampilkan SweetAlert error untuk kesalahan jaringan
      await Swal.fire({
        icon: 'error',
        title: 'Kesalahan Jaringan!',
        text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        confirmButtonColor: '#dc2626',
      });
      
      setErrors({ general: 'Terjadi kesalahan jaringan. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen flex items-center justify-center bg-gray-900 relative">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50"
          style={{
            backgroundImage: "url('/CandiKR.jpg')",
          }}
        />

        {/* Card */}
        <div className="relative z-10 bg-[#0f4d1b] w-full max-w-4xl rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 shadow-lg">
          
          {/* FORM KIRI */}
          <div className="w-full md:w-1/2 text-white">
            <h2 className="text-xl font-semibold text-center mb-6">
              AUTENTIKASI
            </h2>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.general}
              </div>
            )}

            <label htmlFor="nama" className="block text-sm mb-1">Nama Pengguna</label>
            <input
              id="nama"
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className={`w-full mb-1 p-3 rounded-full bg-white text-black focus:outline-none focus:ring-2 ${
                errors.nama ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
              }`}
              placeholder="Masukkan nama"
              required
            />
            {errors.nama && <p className="text-red-300 text-sm mb-3">{errors.nama}</p>}

            <label htmlFor="email" className="block text-sm mb-1">Alamat Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full mb-1 p-3 rounded-full bg-white text-black pr-10 focus:outline-none focus:ring-2 ${
                errors.email ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
              }`}
              placeholder="Masukkan email"
              required
            />
            {errors.email && <p className="text-red-300 text-sm mb-3">{errors.email}</p>}

            <label htmlFor="password" className="block text-sm mb-1">Kata Sandi</label>
            <div className="relative mb-1">
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full p-3 rounded-full bg-white text-black pr-10 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                }`}
                placeholder="Masukkan password"
                required
                minLength={6}
              />
            </div>
            {errors.password && <p className="text-red-300 text-sm mb-3">{errors.password}</p>}

            <p className="text-sm text-center mb-6">
              Sudah punya akun?{" "}
              <a href="/login" className="text-green-300 underline">
                Masuk
              </a>
            </p>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full py-3 rounded-full font-semibold ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#7ca94f] hover:bg-[#6b9344] text-white'
              }`}
            >
              {isLoading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>


          <div className="w-full md:w-1/2 flex flex-col items-center text-white">
            <img src="/karakter-bali.png" alt="Karakter" className="w-48 mb-6" />

            <p className="text-sm text-green-200 mb-3">atau masuk dengan</p>

            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="flex items-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold px-6 py-2.5 rounded-full shadow transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>
          </div>

        </div>
      </section>
    </>
  );
}
