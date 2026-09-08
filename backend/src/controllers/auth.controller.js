// src/controllers/auth.controller.js
import authService from '../services/auth.service.js';

const register = async (req, res) => {
  try {
    const { nama, email, password, role_id } = req.body;
    
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi'
      });
    }

    // Hanya visitor (role_id = 3) yang bisa register sendiri
    // Pengelola (role_id = 2) harus dibuat oleh admin
    const allowedRoleId = role_id || 3; // Default visitor
    
    if (allowedRoleId === 2) {
      return res.status(403).json({
        success: false,
        message: 'Akun pengelola hanya bisa dibuat oleh admin'
      });
    }
    
    if (allowedRoleId === 1) {
      return res.status(403).json({
        success: false,
        message: 'Akun admin menggunakan Google SSO'
      });
    }

    const result = await authService.register({ nama, email, password, role_id: allowedRoleId });
    
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    const result = await authService.login({ email, password });
    
    res.json({
      success: true,
      message: 'Login berhasil',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token wajib diisi'
      });
    }

    const result = await authService.refreshToken(refresh_token);
    
    res.json({
      success: true,
      message: 'Token berhasil diperbarui',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (refresh_token) {
      await authService.logout(refresh_token);
    }
    
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await authService.getProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    await authService.forgotPassword(email);
    res.json({ success: true, message: 'Link reset password telah dikirim ke email Anda' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token dan password wajib diisi' });
    await authService.resetPassword(token, password);
    res.json({ success: true, message: 'Password berhasil direset. Silakan login.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nama, telepon } = req.body;
    const updated = await authService.updateProfile(req.user.id, { nama, telepon });
    // Update cookie-friendly data
    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};