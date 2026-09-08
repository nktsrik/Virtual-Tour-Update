// src/controllers/infoPoint.controller.js
import infoPointRepository from '../repositories/infoPoint.repository.js';

const getAllInfoPoints = async (req, res) => {
  try {
    const { virtual_tour_id } = req.query;
    
    if (!virtual_tour_id) {
      return res.status(400).json({
        success: false,
        message: 'Virtual tour ID wajib diisi'
      });
    }

    const infoPoints = await infoPointRepository.getAllInfoPoints(virtual_tour_id);
    
    res.json({
      success: true,
      message: 'Daftar info point berhasil diambil',
      data: infoPoints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getInfoPointById = async (req, res) => {
  try {
    const { id } = req.params;
    const infoPoint = await infoPointRepository.getInfoPointById(id);
    
    if (!infoPoint) {
      return res.status(404).json({
        success: false,
        message: 'Info point tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Detail info point berhasil diambil',
      data: infoPoint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createInfoPoint = async (req, res) => {
  try {
    // Hanya pengelola dan admin yang bisa buat info point
    if (req.user.role_id !== 1 && req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan pengelola yang dapat membuat info point'
      });
    }

    const { judul, pitch, yaw, virtual_tour_id } = req.body;
    
    if (!judul || (!pitch && pitch !== 0) || (!yaw && yaw !== 0) || !virtual_tour_id) {
      return res.status(400).json({
        success: false,
        message: 'Judul, pitch, yaw, dan virtual tour ID wajib diisi'
      });
    }

    const infoPoint = await infoPointRepository.createInfoPoint(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Info point berhasil dibuat',
      data: infoPoint
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateInfoPoint = async (req, res) => {
  try {
    // Hanya pengelola dan admin yang bisa update info point
    if (req.user.role_id !== 1 && req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan pengelola yang dapat mengupdate info point'
      });
    }

    const { id } = req.params;
    const infoPoint = await infoPointRepository.updateInfoPoint(id, req.body);
    
    if (!infoPoint) {
      return res.status(404).json({
        success: false,
        message: 'Info point tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Info point berhasil diupdate',
      data: infoPoint
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteInfoPoint = async (req, res) => {
  try {
    // Hanya admin yang bisa delete info point
    if (req.user.role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin yang dapat menghapus info point'
      });
    }

    const { id } = req.params;
    const infoPoint = await infoPointRepository.deleteInfoPoint(id);
    
    if (!infoPoint) {
      return res.status(404).json({
        success: false,
        message: 'Info point tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Info point berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllInfoPoints,
  getInfoPointById,
  createInfoPoint,
  updateInfoPoint,
  deleteInfoPoint
};