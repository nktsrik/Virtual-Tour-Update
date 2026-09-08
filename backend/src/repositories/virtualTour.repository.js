// src/repositories/virtualTour.repository.js
import db from '../config/database.js';

const getAllVirtualTours = async (filters = {}) => {
  try {
    let query = `
      SELECT vt.*, l.nama AS lokasi_nama, s.nama AS status_nama, u.nama AS created_by_nama
      FROM virtual_tour vt
      LEFT JOIN lokasi l ON vt.lokasi_id = l.id
      LEFT JOIN status s ON vt.status_id = s.id
      LEFT JOIN users u ON vt.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.lokasi_id) {
      paramCount++;
      query += ` AND vt.lokasi_id = $${paramCount}`;
      params.push(filters.lokasi_id);
    }

    if (filters.status_id) {
      paramCount++;
      query += ` AND vt.status_id = $${paramCount}`;
      params.push(filters.status_id);
    }

    query += ` ORDER BY vt.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllVirtualTours:', error);
    throw new Error('Gagal mengambil daftar virtual tour');
  }
};

const getVirtualTourById = async (id) => {
  try {
    // Get virtual tour detail
    const tourResult = await db.query(`
      SELECT vt.*, l.nama AS lokasi_nama, s.nama AS status_nama, u.nama AS created_by_nama
      FROM virtual_tour vt
      LEFT JOIN lokasi l ON vt.lokasi_id = l.id
      LEFT JOIN status s ON vt.status_id = s.id
      LEFT JOIN users u ON vt.created_by = u.id
      WHERE vt.id = $1
    `, [id]);
    
    if (tourResult.rows.length === 0) {
      return null;
    }

    const tour = tourResult.rows[0];

    // Get info points
    const infoPointsResult = await db.query(`
      SELECT * FROM info_points 
      WHERE virtual_tour_id = $1
      ORDER BY created_at ASC
    `, [id]);

    tour.info_points = infoPointsResult.rows;

    return tour;
  } catch (error) {
    console.error('Error in getVirtualTourById:', error);
    throw new Error('Gagal mengambil detail virtual tour');
  }
};

const createVirtualTour = async (tourData) => {
  const client = await db.connect();
  try {
    console.log('Creating virtual tour with data:', tourData);
    await client.query('BEGIN');
    
    const result = await client.query(`
      INSERT INTO virtual_tour (nama, deskripsi, image_path, audio_path, pitch, yaw, hfov, is_default, urutan, lokasi_id, status_id, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      tourData.nama,
      tourData.deskripsi,
      tourData.image_path,
      tourData.audio_path || null,
      tourData.pitch || 0,
      tourData.yaw || 0,
      tourData.hfov || 100,
      tourData.is_default || false,
      tourData.urutan || 1,
      tourData.lokasi_id,
      tourData.status_id || 1, // Default draft
      tourData.created_by
    ]);
    
    console.log('Virtual tour created successfully:', result.rows[0]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      table: error.table,
      column: error.column
    });
    console.error('Tour data that failed:', tourData);
    throw new Error('Gagal membuat virtual tour baru');
  } finally {
    client.release();
  }
};

const updateVirtualTour = async (id, tourData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Build dynamic update query based on what fields are provided
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    // Always update these fields
    if (tourData.nama !== undefined) {
      updateFields.push(`nama = $${paramCount++}`);
      values.push(tourData.nama);
    }
    
    if (tourData.deskripsi !== undefined) {
      updateFields.push(`deskripsi = $${paramCount++}`);
      values.push(tourData.deskripsi);
    }
    
    // Only update image_path if a new image is provided
    if (tourData.image_path !== undefined) {
      updateFields.push(`image_path = $${paramCount++}`);
      values.push(tourData.image_path);
    }
    
    if (tourData.audio_path !== undefined) {
      updateFields.push(`audio_path = $${paramCount++}`);
      values.push(tourData.audio_path);
    }
    
    if (tourData.pitch !== undefined) {
      updateFields.push(`pitch = $${paramCount++}`);
      values.push(tourData.pitch);
    }
    
    if (tourData.yaw !== undefined) {
      updateFields.push(`yaw = $${paramCount++}`);
      values.push(tourData.yaw);
    }
    
    if (tourData.hfov !== undefined) {
      updateFields.push(`hfov = $${paramCount++}`);
      values.push(tourData.hfov);
    }
    
    if (tourData.urutan !== undefined) {
      updateFields.push(`urutan = $${paramCount++}`);
      values.push(tourData.urutan);
    }
    
    if (tourData.is_default !== undefined) {
      updateFields.push(`is_default = $${paramCount++}`);
      values.push(tourData.is_default);
    }
    
    if (tourData.lokasi_id !== undefined) {
      updateFields.push(`lokasi_id = $${paramCount++}`);
      values.push(tourData.lokasi_id);
    }
    
    if (tourData.status_id !== undefined) {
      updateFields.push(`status_id = $${paramCount++}`);
      values.push(tourData.status_id);
    }
    
    // Always update timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add ID as last parameter
    values.push(id);
    
    const query = `
      UPDATE virtual_tour 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    console.log('Update query:', query);
    console.log('Update values:', values);
    
    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Virtual tour tidak ditemukan');
    }
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateVirtualTour:', error);
    throw error;
  } finally {
    client.release();
  }
};

const deleteVirtualTour = async (id) => {
  try {
    const result = await db.query('DELETE FROM virtual_tour WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteVirtualTour:', error);
    throw new Error('Gagal menghapus virtual tour');
  }
};

// Update hanya status (untuk submit, approve, reject)
const updateVirtualTourStatus = async (id, statusId) => {
  try {
    console.log(`Updating virtual tour ${id} status to ${statusId}`);
    const result = await db.query(`
      UPDATE virtual_tour 
      SET status_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [statusId, id]);
    
    if (result.rows.length === 0) {
      throw new Error('Virtual tour tidak ditemukan');
    }
    
    console.log('Status updated successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateVirtualTourStatus:', error);
    throw new Error('Gagal mengupdate status virtual tour');
  }
};

// Reject virtual tour dengan alasan
const rejectVirtualTour = async (id, alasan) => {
  try {
    console.log(`Rejecting virtual tour ${id} with reason: ${alasan}`);
    const result = await db.query(`
      UPDATE virtual_tour 
      SET status_id = 4, alasan_penolakan = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [alasan, id]);
    
    if (result.rows.length === 0) {
      throw new Error('Virtual tour tidak ditemukan');
    }
    
    console.log('Virtual tour rejected successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in rejectVirtualTour:', error);
    throw new Error('Gagal menolak virtual tour');
  }
};

// Get only published virtual tours (for public/visitor access)
const getPublishedVirtualTours = async () => {
  try {
    const query = `
      SELECT vt.*, l.nama AS lokasi_nama, s.nama AS status_nama, u.nama AS created_by_nama
      FROM virtual_tour vt
      LEFT JOIN lokasi l ON vt.lokasi_id = l.id
      LEFT JOIN status s ON vt.status_id = s.id
      LEFT JOIN users u ON vt.created_by = u.id
      WHERE LOWER(s.nama) = 'published'
      ORDER BY vt.urutan ASC, vt.created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error in getPublishedVirtualTours:', error);
    throw new Error('Gagal mengambil daftar virtual tour published');
  }
};

export default {
  getAllVirtualTours,
  getPublishedVirtualTours,
  getVirtualTourById,
  createVirtualTour,
  updateVirtualTour,
  deleteVirtualTour,
  updateVirtualTourStatus,
  rejectVirtualTour
};