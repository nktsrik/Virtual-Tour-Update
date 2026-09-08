// src/controllers/lokasi.controller.js
import lokasiService from '../services/lokasi.service.js';

const getAllLokasi = async (req, res) => {
  try {
    const filters = {
      kategori_id: req.query.kategori_id,
      status_id: req.query.status_id
    };

    const lokasi = await lokasiService.getAllLokasi(filters);
    
    res.json({
      success: true,
      message: 'Daftar lokasi berhasil diambil',
      data: lokasi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getLokasiById = async (req, res) => {
  try {
    const { id } = req.params;
    const lokasi = await lokasiService.getLokasiById(id);
    
    res.json({
      success: true,
      message: 'Detail lokasi berhasil diambil',
      data: lokasi
    });
  } catch (error) {
    const statusCode = error.message === 'Lokasi tidak ditemukan' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const createLokasi = async (req, res) => {
  try {
    console.log('Create lokasi - User:', req.user);
    console.log('Create lokasi - Body:', req.body);
    console.log('Create lokasi - Files:', req.files);
    
    // Hanya pengelola dan admin yang bisa buat lokasi
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'pengelola') {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role Anda: ${req.user.role}. Hanya admin dan pengelola yang dapat membuat lokasi`
      });
    }

    // Extract file paths if uploaded
    const thumbnailPath = req.files?.thumbnail 
      ? '/uploads/thumbnails/' + req.files.thumbnail[0].filename 
      : null;

    // Parse semua field dari FormData ke tipe yang benar
    const b = req.body;
    const lokasiData = {
      nama:            b.nama || null,
      deskripsi:       b.deskripsi || null,
      kategori_id:     b.kategori_id ? parseInt(b.kategori_id) : null,
      urutan:          b.urutan !== undefined && b.urutan !== '' ? parseInt(b.urutan) : 0,
      map_x:           b.map_x !== undefined && b.map_x !== '' ? parseFloat(b.map_x) : null,
      map_y:           b.map_y !== undefined && b.map_y !== '' ? parseFloat(b.map_y) : null,
      gate_number:     b.gate_number || null,
      estimasi_durasi: b.estimasi_durasi ? parseInt(b.estimasi_durasi) : 30,
      keterangan_durasi: b.keterangan_durasi || null,
      thumbnail:       thumbnailPath,
    };

    const lokasi = await lokasiService.createLokasi(lokasiData, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Lokasi berhasil dibuat',
      data: lokasi
    });
  } catch (error) {
    console.error('Error in createLokasi:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateLokasi = async (req, res) => {
  try {
    console.log('Update lokasi - User:', req.user);
    console.log('Update lokasi - Body:', req.body);
    console.log('Update lokasi - Files:', req.files);
    
    // Hanya pengelola dan admin yang bisa update lokasi
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'pengelola') {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role Anda: ${req.user.role}. Hanya admin dan pengelola yang dapat mengupdate lokasi`
      });
    }

    const { id } = req.params;
    
    // Extract file paths if new files uploaded
    const thumbnailPath = req.files?.thumbnail 
      ? '/uploads/thumbnails/' + req.files.thumbnail[0].filename 
      : null;

    // Parse semua field dari FormData (semua string) ke tipe yang benar
    const b = req.body;
    const lokasiData = {
      nama:             b.nama || null,
      deskripsi:        b.deskripsi || null,
      kategori_id:      b.kategori_id ? parseInt(b.kategori_id) : null,
      urutan:           b.urutan !== undefined && b.urutan !== '' ? parseInt(b.urutan) : undefined,
      map_x:            b.map_x !== undefined && b.map_x !== '' ? parseFloat(b.map_x) : null,
      map_y:            b.map_y !== undefined && b.map_y !== '' ? parseFloat(b.map_y) : null,
      gate_number:      b.gate_number || null,
      estimasi_durasi:  b.estimasi_durasi ? parseInt(b.estimasi_durasi) : 30,
      keterangan_durasi: b.keterangan_durasi || null,
    };
    
    if (thumbnailPath) {
      lokasiData.thumbnail = thumbnailPath;
    }
    
    const lokasi = await lokasiService.updateLokasi(id, lokasiData, req.user.id, req.user.role);
    
    res.json({
      success: true,
      message: 'Lokasi berhasil diupdate',
      data: lokasi
    });
  } catch (error) {
    console.error('Error in updateLokasi:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                      error.message.includes('tidak memiliki akses') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteLokasi = async (req, res) => {
  try {
    const { id } = req.params;
    await lokasiService.deleteLokasi(id, req.user.id, req.user.role);
    
    res.json({
      success: true,
      message: 'Lokasi berhasil dihapus'
    });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                      error.message.includes('Hanya admin') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const getKategoriLokasi = async (req, res) => {
  try {
    const kategori = await lokasiService.getKategoriLokasi();
    
    res.json({
      success: true,
      message: 'Daftar kategori lokasi berhasil diambil',
      data: kategori
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllLokasi,
  getLokasiById,
  createLokasi,
  updateLokasi,
  deleteLokasi,
  getKategoriLokasi
};