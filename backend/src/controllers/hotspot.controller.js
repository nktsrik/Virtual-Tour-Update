// src/controllers/hotspot.controller.js
import hotspotRepository from '../repositories/hotspot.repository.js';

const getAllHotspots = async (req, res) => {
  try {
    const { virtual_tour_id } = req.query;
    
    if (!virtual_tour_id) {
      return res.status(400).json({
        success: false,
        message: 'Virtual tour ID wajib diisi'
      });
    }

    const hotspots = await hotspotRepository.getAllHotspots(virtual_tour_id);
    
    res.json({
      success: true,
      message: 'Daftar hotspot berhasil diambil',
      data: hotspots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getHotspotById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotspot = await hotspotRepository.getHotspotById(id);
    
    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: 'Hotspot tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Detail hotspot berhasil diambil',
      data: hotspot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createHotspot = async (req, res) => {
  try {
    // Debug logging
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    // Hanya pengelola dan admin yang bisa buat hotspot
    if (req.user.role_id !== 1 && req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan pengelola yang dapat membuat hotspot'
      });
    }

    const { pitch, yaw, virtual_tour_id } = req.body;
    
    console.log('Extracted values:', { pitch, yaw, virtual_tour_id });
    
    if (virtual_tour_id === undefined || virtual_tour_id === null) {
      return res.status(400).json({
        success: false,
        message: 'Virtual tour ID wajib diisi'
      });
    }
    
    if (pitch === undefined || pitch === null || yaw === undefined || yaw === null) {
      return res.status(400).json({
        success: false,
        message: 'Pitch dan yaw wajib diisi'
      });
    }

    const hotspot = await hotspotRepository.createHotspot(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Hotspot berhasil dibuat',
      data: hotspot
    });
  } catch (error) {
    console.error('Error creating hotspot:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateHotspot = async (req, res) => {
  try {
    // Hanya pengelola dan admin yang bisa update hotspot
    if (req.user.role_id !== 1 && req.user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin dan pengelola yang dapat mengupdate hotspot'
      });
    }

    const { id } = req.params;
    const hotspot = await hotspotRepository.updateHotspot(id, req.body);
    
    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: 'Hotspot tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Hotspot berhasil diupdate',
      data: hotspot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteHotspot = async (req, res) => {
  try {
    // Hanya admin yang bisa delete hotspot
    if (req.user.role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin yang dapat menghapus hotspot'
      });
    }

    const { id } = req.params;
    const hotspot = await hotspotRepository.deleteHotspot(id);
    
    if (!hotspot) {
      return res.status(404).json({
        success: false,
        message: 'Hotspot tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Hotspot berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllHotspots,
  getHotspotById,
  createHotspot,
  updateHotspot,
  deleteHotspot
};