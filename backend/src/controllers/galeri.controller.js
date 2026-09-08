// src/controllers/galeri.controller.js
import galeriService from '../services/galeri.service.js';

const getAllGaleri = async (req, res) => {
  try {
    const filters = {
      lokasi_id: req.query.lokasi_id,
      status_id: req.query.status_id,
      is_featured: req.query.is_featured,
    };

    const galeri = await galeriService.getAllGaleri(filters);

    res.json({
      success: true,
      message: 'Daftar galeri berhasil diambil',
      data: galeri,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPublishedGaleri = async (req, res) => {
  try {
    const filters = {
      lokasi_id: req.query.lokasi_id,
    };

    const galeri = await galeriService.getPublishedGaleri(filters);

    res.json({
      success: true,
      message: 'Daftar galeri berhasil diambil',
      data: galeri,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getGaleriById = async (req, res) => {
  try {
    const { id } = req.params;
    const galeri = await galeriService.getGaleriById(id);

    res.json({
      success: true,
      message: 'Detail galeri berhasil diambil',
      data: galeri,
    });
  } catch (error) {
    const statusCode = error.message === 'Galeri tidak ditemukan' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const createGaleri = async (req, res) => {
  try {
    // Hanya pengelola dan admin yang bisa buat galeri
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'pengelola') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan pengelola yang dapat membuat galeri',
      });
    }

    if (!req.body.judul) {
      return res.status(400).json({
        success: false,
        message: 'Judul galeri wajib diisi',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File gambar wajib diupload',
      });
    }

    // Set file info dari upload
    const galeriData = {
      ...req.body,
      file_path: `/uploads/images360/${req.file.filename}`,
      ukuran_file: req.file.size,
      format_file: req.file.mimetype,
    };

    const galeri = await galeriService.createGaleri(galeriData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Galeri berhasil dibuat',
      data: galeri,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateGaleri = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'pengelola') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan pengelola yang dapat mengupdate galeri',
      });
    }

    const { id } = req.params;
    const galeri = await galeriService.updateGaleri(id, req.body, req.user.id, req.user.role);

    res.json({
      success: true,
      message: 'Galeri berhasil diupdate',
      data: galeri,
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 :
                       error.message.includes('tidak memiliki akses') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const galeri = await galeriService.submitForReview(id, req.user.id);

    res.json({
      success: true,
      message: 'Galeri berhasil disubmit untuk review',
      data: galeri,
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 :
                       error.message.includes('tidak memiliki akses') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const approveGaleri = async (req, res) => {
  try {
    // Hanya admin yang bisa approve
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menyetujui galeri',
      });
    }

    const { id } = req.params;
    const galeri = await galeriService.approveGaleri(id);

    res.json({
      success: true,
      message: 'Galeri berhasil disetujui dan dipublish',
      data: galeri,
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectGaleri = async (req, res) => {
  try {
    // Hanya admin yang bisa reject
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menolak galeri',
      });
    }

    const { id } = req.params;
    const { alasan } = req.body;

    if (!alasan) {
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan wajib diisi',
      });
    }

    const galeri = await galeriService.rejectGaleri(id, alasan);

    res.json({
      success: true,
      message: 'Galeri berhasil ditolak',
      data: galeri,
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const reviseGaleri = async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat meminta perbaikan galeri',
      });
    }

    const { id } = req.params;
    const { alasan } = req.body;

    if (!alasan) {
      return res.status(400).json({
        success: false,
        message: 'Catatan perbaikan wajib diisi',
      });
    }

    const galeri = await galeriService.reviseGaleri(id, alasan);

    res.json({
      success: true,
      message: 'Galeri dikembalikan ke draft untuk diperbaiki',
      data: galeri,
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteGaleri = async (req, res) => {
  try {
    const { id } = req.params;
    await galeriService.deleteGaleri(id, req.user.id, req.user.role);

    res.json({
      success: true,
      message: 'Galeri berhasil dihapus',
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 :
                       error.message.includes('tidak memiliki akses') ? 403 :
                       error.message.includes('hanya dapat dihapus') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllGaleri,
  getPublishedGaleri,
  getGaleriById,
  createGaleri,
  updateGaleri,
  submitForReview,
  approveGaleri,
  rejectGaleri,
  reviseGaleri,
  deleteGaleri,
};
