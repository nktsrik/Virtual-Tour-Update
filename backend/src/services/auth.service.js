// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import authRepository from '../repositories/auth.repository.js';
import { sendResetPasswordEmail } from '../utils/email.util.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    role_name: user.role_name || user.role
  };
  
  console.log('Token payload:', payload); // Debug log

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

  return { accessToken, refreshToken };
};

const register = async (userData) => {
  const { nama, email, password, role = 'visitor' } = userData; // Default role visitor

  // Check if email already exists
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const newUser = await authRepository.create({
    nama,
    email,
    password: hashedPassword,
    role
  });

  // Generate tokens
  const tokens = generateTokens(newUser);

  // Save refresh token
  await authRepository.saveRefreshToken(newUser.id, tokens.refreshToken);

  return {
    user: {
      id: newUser.id,
      nama: newUser.nama,
      email: newUser.email,
      role: newUser.role,
      role_name: newUser.role_name || newUser.role
    },
    tokens
  };
};

const login = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await authRepository.findByEmail(email);
  console.log('User found:', user); // Debug log
  
  if (!user) {
    throw new Error('Email atau password salah');
  }

  // Check password
  console.log('User password hash:', user.password); // Debug log
  console.log('Input password:', password); // Debug log
  
  if (!user.password) {
    throw new Error('User tidak memiliki password. Gunakan Google login.');
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isPasswordValid); // Debug log
  
  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Save refresh token
  await authRepository.saveRefreshToken(user.id, tokens.refreshToken);

  const response = {
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      role_name: user.role_name || user.role
    },
    tokens
  };

  console.log('Login response:', response); // Debug log
  return response;
};

const refreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Check if refresh token exists in database
    const tokenRecord = await authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      throw new Error('Refresh token tidak valid');
    }

    // Get user data
    const user = await authRepository.findById(decoded.id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Replace old refresh token with new one
    await authRepository.updateRefreshToken(refreshToken, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name
      },
      tokens
    };
  } catch (error) {
    throw new Error('Refresh token tidak valid');
  }
};

const logout = async (refreshToken) => {
  await authRepository.deleteRefreshToken(refreshToken);
};

const getProfile = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role, // String role from database
    role_name: user.role_name || user.role, // Backward compatibility
    role_id: user.role_id, // If exists for backward compatibility
    created_at: user.created_at
  };
};

const forgotPassword = async (email) => {
  const user = await authRepository.findByEmail(email);
  if (!user) throw new Error('Email tidak terdaftar');
  if (user.google_id && !user.password) throw new Error('Akun ini menggunakan Google Login, tidak perlu reset password');

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  await authRepository.saveResetToken(user.id, token, expires);
  await sendResetPasswordEmail(user.email, user.nama, token);
};

const resetPassword = async (token, newPassword) => {
  const user = await authRepository.findByResetToken(token);
  if (!user) throw new Error('Link reset password tidak valid atau sudah kadaluarsa');

  if (newPassword.length < 6) throw new Error('Password minimal 6 karakter');

  const hashed = await bcrypt.hash(newPassword, 12);
  await authRepository.updatePassword(user.id, hashed);
};

const googleLogin = async (googleData) => {
  const { email, nama, google_id } = googleData;

  // Cari user berdasarkan email
  let user = await authRepository.findByEmail(email);
  
  if (!user) {
    // Admin emails hardcoded (lebih sederhana)
    const adminEmails = [
      'admin@test.com',
      'srihati@kebunaraya.com',
      'srihatiniketut@gmail.com'
    ];
    
    let role_id = 3; // Default visitor
    if (adminEmails.includes(email)) {
      role_id = 1; // Admin
    }
    
    // Buat user baru
    user = await authRepository.create({
      nama,
      email,
      password: null, // Google user tidak perlu password
      role_id,
      google_id
    });
  } else {
    // Update google_id jika belum ada
    if (!user.google_id) {
      await authRepository.updateGoogleId(user.id, google_id);
      user.google_id = google_id;
    }
    
    // Pengelola tidak bisa login via Google
    if (user.role_id === 2) {
      throw new Error('Pengelola harus login menggunakan email dan password');
    }
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Save refresh token
  await authRepository.saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name
    },
    tokens
  };
};

const updateProfile = async (userId, data) => {
  if (!data.nama || !data.nama.trim()) throw new Error('Nama wajib diisi');
  return await authRepository.updateProfile(userId, {
    nama: data.nama.trim(),
    telepon: data.telepon?.trim() || null,
  });
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};