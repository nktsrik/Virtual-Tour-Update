// src/repositories/galeri.repository.js
import db from '../config/database.js';

const getAllGaleri = async (filters = {}) => {
  try {
    let query = `
      SELECT gm.*, l.nama AS lokasi_nama, s.nama AS status_nama, u.nama AS created_by_nama
      FROM galeri_media gm
      LEFT JOIN lokasi l ON gm.lokasi_id = l.id
      LEFT JOIN status s ON gm.status_id = s.id
      LEFT JOIN users u ON gm.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (filters.lokasi_id) {
      paramCount++;
      query += ` AND gm.lokasi_id = $${paramCount}`;
      params.push(filters.lokasi_id);
    }

    if (filters.status_id) {
      paramCount++;
      query += ` AND gm.status_id = $${paramCount}`;
      params.push(filters.status_id);
    }

    if (filters.is_featured) {
      paramCount++;
      query += ` AND gm.is_featured = $${paramCount}`;
      params.push(filters.is_featured);
    }

    query += ` ORDER BY gm.urutan ASC, gm.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllGaleri:', error);
    throw new Error('Gagal mengambil daftar galeri');
  }
};

const getPublishedGaleri = async (filters = {}) => {
  try {
    let query = `
      SELECT gm.*, l.nama AS lokasi_nama, u.nama AS created_by_nama
      FROM galeri_media gm
      LEFT JOIN lokasi l ON gm.lokasi_id = l.id
      LEFT JOIN users u ON gm.created_by = u.id
      WHERE gm.status_id = 3
    `;

    const params = [];
    let paramCount = 0;

    if (filters.lokasi_id) {
      paramCount++;
      query += ` AND gm.lokasi_id = $${paramCount}`;
      params.push(filters.lokasi_id);
    }

    query += ` ORDER BY gm.is_featured DESC, gm.urutan ASC, gm.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error in getPublishedGaleri:', error);
    throw new Error('Gagal mengambil galeri');
  }
};

const getGaleriById = async (id) => {
  try {
    const result = await db.query(
      `SELECT gm.*, l.nama AS lokasi_nama, s.nama AS status_nama, u.nama AS created_by_nama
       FROM galeri_media gm
       LEFT JOIN lokasi l ON gm.lokasi_id = l.id
       LEFT JOIN status s ON gm.status_id = s.id
       LEFT JOIN users u ON gm.created_by = u.id
       WHERE gm.id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in getGaleriById:', error);
    throw new Error('Gagal mengambil detail galeri');
  }
};

const createGaleri = async (galeriData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO galeri_media 
        (judul, deskripsi, file_path, thumbnail_path, ukuran_file, format_file, resolusi, lokasi_id, status_id, created_by, is_featured, urutan, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        galeriData.judul,
        galeriData.deskripsi,
        galeriData.file_path,
        galeriData.thumbnail_path || null,
        galeriData.ukuran_file || null,
        galeriData.format_file || null,
        galeriData.resolusi || null,
        galeriData.lokasi_id ? parseInt(galeriData.lokasi_id) : null,
        galeriData.status_id ? parseInt(galeriData.status_id) : 1,
        galeriData.created_by,
        galeriData.is_featured === 'true' || galeriData.is_featured === true || false,
        parseInt(galeriData.urutan) || 0,
        galeriData.tags || null,
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createGaleri:', error);
    throw new Error('Gagal membuat galeri baru');
  } finally {
    client.release();
  }
};

const updateGaleri = async (id, galeriData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE galeri_media
       SET judul = $1, deskripsi = $2, lokasi_id = $3, status_id = $4,
           is_featured = $5, urutan = $6, tags = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        galeriData.judul,
        galeriData.deskripsi,
        galeriData.lokasi_id || null,
        galeriData.status_id || 1,
        galeriData.is_featured || false,
        galeriData.urutan || 0,
        galeriData.tags || null,
        id,
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateGaleri:', error);
    throw new Error('Gagal mengupdate galeri');
  } finally {
    client.release();
  }
};

const updateGaleriStatus = async (id, status_id, alasan_penolakan = null) => {
  try {
    const result = await db.query(
      `UPDATE galeri_media
       SET status_id = $1, alasan_penolakan = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status_id, alasan_penolakan, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateGaleriStatus:', error);
    throw new Error('Gagal mengupdate status galeri');
  }
};

const deleteGaleri = async (id) => {
  try {
    const result = await db.query(
      'DELETE FROM galeri_media WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteGaleri:', error);
    throw new Error('Gagal menghapus galeri');
  }
};

export default {
  getAllGaleri,
  getPublishedGaleri,
  getGaleriById,
  createGaleri,
  updateGaleri,
  updateGaleriStatus,
  deleteGaleri,
};
