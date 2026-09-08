// src/repositories/lokasi.repository.js
import db from '../config/database.js';

const getAllLokasi = async (filters = {}) => {
  try {
    let query = `
      SELECT l.*, k.nama AS kategori_nama, s.nama AS status_nama, u.nama AS created_by_nama,
        (
          SELECT json_build_object('id', vt.id, 'nama', vt.nama, 'deskripsi', vt.deskripsi, 'image_path', vt.image_path, 'status_id', vt.status_id)
          FROM virtual_tour vt
          WHERE vt.lokasi_id = l.id
          ORDER BY (CASE WHEN vt.status_id = 3 THEN 0 ELSE 1 END), vt.urutan ASC, vt.created_at ASC
          LIMIT 1
        ) AS virtual_tour
      FROM lokasi l
      LEFT JOIN kategori_lokasi k ON l.kategori_id = k.id
      LEFT JOIN status s ON l.status_id = s.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (filters.kategori_id) {
      paramCount++;
      query += ` AND l.kategori_id = $${paramCount}`;
      params.push(filters.kategori_id);
    }

    if (filters.status_id) {
      paramCount++;
      query += ` AND l.status_id = $${paramCount}`;
      params.push(filters.status_id);
    }

    query += ` ORDER BY l.urutan ASC, l.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllLokasi:', error);
    throw new Error('Gagal mengambil daftar lokasi');
  }
};

const getLokasiById = async (id) => {
  try {
    const result = await db.query(`
      SELECT l.*, k.nama AS kategori_nama, s.nama AS status_nama, u.nama AS created_by_nama,
        (
          SELECT json_build_object('id', vt.id, 'nama', vt.nama, 'deskripsi', vt.deskripsi, 'image_path', vt.image_path, 'status_id', vt.status_id)
          FROM virtual_tour vt
          WHERE vt.lokasi_id = l.id
          ORDER BY (CASE WHEN vt.status_id = 3 THEN 0 ELSE 1 END), vt.urutan ASC, vt.created_at ASC
          LIMIT 1
        ) AS virtual_tour
      FROM lokasi l
      LEFT JOIN kategori_lokasi k ON l.kategori_id = k.id
      LEFT JOIN status s ON l.status_id = s.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE l.id = $1
    `, [id]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in getLokasiById:', error);
    throw new Error('Gagal mengambil detail lokasi');
  }
};

const createLokasi = async (lokasiData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(`
      INSERT INTO lokasi (nama, deskripsi, thumbnail, audio_path, urutan, kategori_id, status_id, created_by, map_x, map_y, gate_number, estimasi_durasi, keterangan_durasi, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      lokasiData.nama,
      lokasiData.deskripsi,
      lokasiData.thumbnail,
      lokasiData.audio_path,
      lokasiData.urutan || 0,
      lokasiData.kategori_id,
      lokasiData.status_id || 1,
      lokasiData.created_by,
      lokasiData.map_x || null,
      lokasiData.map_y || null,
      lokasiData.gate_number || null,
      lokasiData.estimasi_durasi || 30,
      lokasiData.keterangan_durasi || null,
    ]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createLokasi:', error);
    throw new Error('Gagal membuat lokasi baru');
  } finally {
    client.release();
  }
};

const updateLokasi = async (id, lokasiData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Ambil data lama dulu
    const existing = await client.query('SELECT * FROM lokasi WHERE id = $1', [id]);
    const old = existing.rows[0];

    const result = await client.query(`
      UPDATE lokasi 
      SET nama = $1, deskripsi = $2, thumbnail = $3,
          urutan = $4, kategori_id = $5,
          map_x = $6, map_y = $7, gate_number = $8,
          estimasi_durasi = $9, keterangan_durasi = $10,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      lokasiData.nama ?? old.nama,
      lokasiData.deskripsi ?? old.deskripsi,
      lokasiData.thumbnail ?? old.thumbnail,
      lokasiData.urutan ?? old.urutan,
      lokasiData.kategori_id ?? old.kategori_id,
      lokasiData.map_x ?? old.map_x ?? null,
      lokasiData.map_y ?? old.map_y ?? null,
      lokasiData.gate_number ?? old.gate_number ?? null,
      lokasiData.estimasi_durasi ?? old.estimasi_durasi ?? 30,
      lokasiData.keterangan_durasi ?? old.keterangan_durasi ?? null,
      id
    ]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateLokasi:', error);
    throw new Error('Gagal mengupdate lokasi');
  } finally {
    client.release();
  }
};

const deleteLokasi = async (id) => {
  try {
    const result = await db.query('DELETE FROM lokasi WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteLokasi:', error);
    throw new Error('Gagal menghapus lokasi');
  }
};

const getKategoriLokasi = async () => {
  try {
    const result = await db.query('SELECT * FROM kategori_lokasi ORDER BY nama ASC');
    return result.rows;
  } catch (error) {
    console.error('Error in getKategoriLokasi:', error);
    throw new Error('Gagal mengambil kategori lokasi');
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