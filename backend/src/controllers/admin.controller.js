// src/controllers/admin.controller.js
import authService from '../services/auth.service.js';
import authRepository from '../repositories/auth.repository.js';

const createPengelola = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang bisa membuat akun pengelola' });
    }

    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
    }

    const result = await authService.register({ nama, email, password, role: 'pengelola' });
    res.status(201).json({ success: true, message: 'Akun pengelola berhasil dibuat', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang bisa melihat semua user' });
    }
    const users = await authRepository.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    const { id } = req.params;
    const { is_active } = req.body;
    const user = await authRepository.toggleUserStatus(id, is_active);
    res.json({ success: true, message: 'Status berhasil diubah', data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
    }
    await authRepository.deleteUser(id);
    res.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// === ADMIN EMAIL MANAGEMENT ===
const getAdminEmails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang bisa melihat daftar admin'
      });
    }

    const adminEmails = await authRepository.getAllAdminEmails();
    
    res.json({
      success: true,
      message: 'Daftar admin berhasil diambil',
      data: adminEmails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addAdminEmail = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang bisa menambah admin'
      });
    }

    const { email, nama } = req.body;
    
    if (!email || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Email dan nama wajib diisi'
      });
    }

    const newAdmin = await authRepository.addAdminEmail(email, nama, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Admin baru berhasil ditambahkan',
      data: newAdmin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const removeAdminEmail = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang bisa menghapus admin'
      });
    }

    const { id } = req.params;
    
    await authRepository.removeAdminEmail(id);
    
    res.json({
      success: true,
      message: 'Admin berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createPengelola,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAdminEmails,
  addAdminEmail,
  removeAdminEmail
};