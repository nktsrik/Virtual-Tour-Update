// src/controllers/virtualTour.controller.js
import virtualTourService from '../services/virtualTour.service.js';

const getAllVirtualTours = async (req, res) => {
  try {
    const filters = {
      lokasi_id: req.query.lokasi_id,
      status_id: req.query.status_id
    };

    const tours = await virtualTourService.getAllVirtualTours(filters);
    
    res.json({
      success: true,
      message: 'Daftar virtual tour berhasil diambil',
      data: tours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getVirtualTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await virtualTourService.getVirtualTourById(id);
    
    res.json({
      success: true,
      message: 'Detail virtual tour berhasil diambil',
      data: tour
    });
  } catch (error) {
    const statusCode = error.message === 'Virtual tour tidak ditemukan' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const createVirtualTour = async (req, res) => {
  try {
    console.log('=== CREATE VIRTUAL TOUR DEBUG ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    // Hanya pengelola dan admin yang bisa buat virtual tour
    console.log('User role check:', req.user.role);
    
    // Check role by string (from database)
    const userRole = req.user.role?.toLowerCase();
    const isAdmin = userRole === 'admin';
    const isPengelola = userRole === 'pengelola';
    
    if (!isAdmin && !isPengelola) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role '${req.user.role}' tidak dapat membuat virtual tour. Hanya admin dan pengelola yang diizinkan.`
      });
    }

    // Validate required fields
    if (!req.body.nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama virtual tour wajib diisi'
      });
    }

    // Handle uploaded file
    if (req.file) {
      req.body.image_path = `/uploads/images360/${req.file.filename}`;
      console.log('Image uploaded:', req.body.image_path);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Gambar 360° wajib diupload'
      });
    }
    
    // Validate lokasi_id exists
    if (req.body.lokasi_id) {
      const db = await import('../config/database.js');
      const lokasiCheck = await db.default.query('SELECT id FROM lokasi WHERE id = $1', [req.body.lokasi_id]);
      
      if (lokasiCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Lokasi dengan ID ${req.body.lokasi_id} tidak ditemukan. Pilih lokasi yang valid.`
        });
      }
    }
    
    // Set default values
    // Pengelola: status = draft (1), Admin: bisa set status apapun
    if (isPengelola) {
      req.body.status_id = 1; // Always draft for pengelola
    } else if (isAdmin) {
      req.body.status_id = req.body.status_id || 1;
    }
    
    req.body.is_default = req.body.is_default || false;
    
    // Use first available lokasi if not specified
    if (!req.body.lokasi_id) {
      const db = await import('../config/database.js');
      const firstLokasi = await db.default.query('SELECT id FROM lokasi ORDER BY id LIMIT 1');
      req.body.lokasi_id = firstLokasi.rows[0]?.id || 2;
    }

    console.log('Final tour data:', req.body);

    const tour = await virtualTourService.createVirtualTour(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: isPengelola 
        ? 'Virtual tour berhasil dibuat dengan status draft. Submit untuk review agar bisa dipublikasikan.' 
        : 'Virtual tour berhasil dibuat',
      data: tour
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateVirtualTour = async (req, res) => {
  try {
    console.log('=== UPDATE VIRTUAL TOUR ===');
    console.log('Update virtual tour - User:', req.user);
    console.log('Tour ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    // Hanya pengelola dan admin yang bisa update virtual tour
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'pengelola') {
      console.log('❌ Access denied - Role:', userRole);
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role Anda: ${req.user.role}. Hanya admin dan pengelola yang dapat mengupdate virtual tour`
      });
    }

    // Handle uploaded file
    if (req.file) {
      req.body.image_path = `/uploads/images360/${req.file.filename}`;
      console.log('✅ Image uploaded:', req.body.image_path);
    }
    
    // Set default values if not provided
    req.body.status_id = req.body.status_id || 1;
    req.body.is_default = req.body.is_default || false;

    const { id } = req.params;
    console.log('🔄 Calling service to update tour...');
    const tour = await virtualTourService.updateVirtualTour(id, req.body, req.user.id, req.user.role);
    
    console.log('✅ Tour updated successfully:', tour);
    const response = {
      success: true,
      message: 'Virtual tour berhasil diupdate',
      data: tour
    };
    console.log('📤 Sending response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error in updateVirtualTour:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                      error.message.includes('tidak memiliki akses') ? 403 : 400;
    const errorResponse = {
      success: false,
      message: error.message
    };
    console.log('📤 Sending error response:', errorResponse);
    res.status(statusCode).json(errorResponse);
  }
};

const deleteVirtualTour = async (req, res) => {
  try {
    console.log('Delete virtual tour - User:', req.user);
    const { id } = req.params;
    await virtualTourService.deleteVirtualTour(id, req.user.id, req.user.role);
    
    res.json({
      success: true,
      message: 'Virtual tour berhasil dihapus'
    });
  } catch (error) {
    console.error('Error in deleteVirtualTour:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                      error.message.includes('Hanya admin') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Submit virtual tour untuk review (pengelola)
const submitForReview = async (req, res) => {
  try {
    console.log('Submit for review - User:', req.user);
    const { id } = req.params;
    
    // Hanya pengelola yang bisa submit for review
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'pengelola') {
      return res.status(403).json({
        success: false,
        message: `Hanya pengelola yang dapat submit virtual tour untuk review. Role Anda: ${req.user.role}`
      });
    }

    const tour = await virtualTourService.submitForReview(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Virtual tour berhasil disubmit untuk review. Menunggu persetujuan admin.',
      data: tour
    });
  } catch (error) {
    console.error('Error in submitForReview:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 
                      error.message.includes('tidak memiliki akses') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Approve virtual tour (admin)
const approveVirtualTour = async (req, res) => {
  try {
    console.log('Approve tour - User:', req.user);
    const { id } = req.params;
    
    // Hanya admin yang bisa approve
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Hanya admin yang dapat menyetujui virtual tour. Role Anda: ${req.user.role}`
      });
    }

    const tour = await virtualTourService.approveVirtualTour(id);
    
    res.json({
      success: true,
      message: 'Virtual tour berhasil disetujui dan dipublikasikan',
      data: tour
    });
  } catch (error) {
    console.error('Error in approveVirtualTour:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Reject virtual tour (admin) - hapus permanen
const rejectVirtualTour = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya admin yang dapat menolak virtual tour.' });
    }
    const db = await import('../config/database.js');
    const result = await db.default.query('DELETE FROM virtual_tour WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new Error('Virtual tour tidak ditemukan');
    res.json({ success: true, message: 'Virtual tour ditolak dan dihapus permanen.' });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// Minta perbaikan/revisi virtual tour (admin) - status revision (5)
const reviseVirtualTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { alasan } = req.body;
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Hanya admin yang dapat meminta perbaikan.' });
    }
    const db = await import('../config/database.js');
    const result = await db.default.query(
      `UPDATE virtual_tour SET status_id = 5, alasan_penolakan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [alasan, id]
    );
    if (result.rows.length === 0) throw new Error('Virtual tour tidak ditemukan');
    res.json({ success: true, message: 'Virtual tour dikembalikan untuk diperbaiki.', data: result.rows[0] });
  } catch (error) {
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// Get pending virtual tours (admin)
const getPendingVirtualTours = async (req, res) => {
  try {
    console.log('=== GET PENDING VIRTUAL TOURS DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.user.role type:', typeof req.user.role);
    console.log('req.user.role value:', req.user.role);
    console.log('req.user object keys:', Object.keys(req.user || {}));
    
    // Hanya admin yang bisa lihat pending tours
    // Check role as string (from database: 'admin', 'pengelola', 'visitor')
    // Also check role_id for backward compatibility (1 = admin)
    const userRole = req.user?.role?.toLowerCase();
    const isAdmin = userRole === 'admin' || req.user?.role_id === 1 || req.user?.role_id === '1';
    
    console.log('userRole (lowercase):', userRole);
    console.log('isAdmin check result:', isAdmin);
    
    if (!isAdmin) {
      console.log('Access denied - Role:', userRole, 'role_id:', req.user?.role_id);
      return res.status(403).json({
        success: false,
        message: `Hanya admin yang dapat melihat virtual tour yang pending. Role Anda: ${req.user?.role || 'undefined'}`
      });
    }

    const tours = await virtualTourService.getPendingVirtualTours();
    
    res.json({
      success: true,
      message: 'Daftar virtual tour pending berhasil diambil',
      data: tours
    });
  } catch (error) {
    console.error('Error in getPendingVirtualTours:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get published virtual tours (public)
const getPublishedVirtualTours = async (req, res) => {
  try {
    // Public endpoint - anyone can access published tours
    const tours = await virtualTourService.getPublishedVirtualTours();
    
    res.json({
      success: true,
      message: 'Daftar virtual tour published berhasil diambil',
      data: tours
    });
  } catch (error) {
    console.error('Error in getPublishedVirtualTours:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllVirtualTours,
  getPublishedVirtualTours,
  getVirtualTourById,
  createVirtualTour,
  updateVirtualTour,
  deleteVirtualTour,
  submitForReview,
  approveVirtualTour,
  rejectVirtualTour,
  reviseVirtualTour,
  getPendingVirtualTours
};