import pool from '../config/database.js';

const rencanaKunjunganRepository = {
  async create(userId, data) {
    const { tanggal, jam_mulai, jam_selesai, tipe_trip, jumlah_orang, catatan, lokasi_list } = data;
    const result = await pool.query(
      `INSERT INTO rencana_kunjungan (user_id, tanggal, jam_mulai, jam_selesai, tipe_trip, jumlah_orang, catatan, lokasi_list, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [userId, tanggal || null, jam_mulai || null, jam_selesai || null, tipe_trip || null, jumlah_orang || null, catatan || null, JSON.stringify(lokasi_list)]
    );
    return result.rows[0];
  },

  async addLokasi(userId, lokasiData) {
    // Cek apakah lokasi sudah ada di rencana user (berdasarkan lokasiId di dalam lokasi_list)
    const existing = await pool.query(
      `SELECT id, lokasi_list FROM rencana_kunjungan WHERE user_id = $1 AND tanggal IS NULL`,
      [userId]
    );

    if (existing.rows.length > 0) {
      // Sudah ada rencana draft, cek apakah lokasi sudah ada
      const row = existing.rows[0];
      const list = typeof row.lokasi_list === 'string' ? JSON.parse(row.lokasi_list) : row.lokasi_list;
      const sudahAda = list.some(l => l.lokasiId === lokasiData.lokasiId);
      if (sudahAda) return row; // skip duplikat

      // Tambahkan lokasi ke list yang sudah ada
      const updated = [...list, lokasiData];
      const result = await pool.query(
        `UPDATE rencana_kunjungan SET lokasi_list = $1 WHERE id = $2 RETURNING *`,
        [JSON.stringify(updated), row.id]
      );
      return result.rows[0];
    } else {
      // Buat rencana draft baru
      const result = await pool.query(
        `INSERT INTO rencana_kunjungan (user_id, lokasi_list, created_at)
         VALUES ($1, $2, NOW()) RETURNING *`,
        [userId, JSON.stringify([lokasiData])]
      );
      return result.rows[0];
    }
  },

  async removeLokasi(userId, lokasiId) {
    const existing = await pool.query(
      `SELECT id, lokasi_list FROM rencana_kunjungan WHERE user_id = $1 AND tanggal IS NULL`,
      [userId]
    );
    if (existing.rows.length === 0) return null;

    const row = existing.rows[0];
    const list = typeof row.lokasi_list === 'string' ? JSON.parse(row.lokasi_list) : row.lokasi_list;
    const updated = list.filter(l => l.lokasiId !== lokasiId);

    if (updated.length === 0) {
      // Hapus seluruh record jika kosong
      await pool.query(`DELETE FROM rencana_kunjungan WHERE id = $1`, [row.id]);
      return null;
    }

    const result = await pool.query(
      `UPDATE rencana_kunjungan SET lokasi_list = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(updated), row.id]
    );
    return result.rows[0];
  },

  async getDraft(userId) {
    const result = await pool.query(
      `SELECT * FROM rencana_kunjungan WHERE user_id = $1 AND tanggal IS NULL ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async getByUser(userId) {
    const result = await pool.query(
      `SELECT * FROM rencana_kunjungan WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getById(id, userId) {
    const result = await pool.query(
      `SELECT * FROM rencana_kunjungan WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0];
  },

  async delete(id, userId) {
    const result = await pool.query(
      `DELETE FROM rencana_kunjungan WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }
};

export default rencanaKunjunganRepository;
