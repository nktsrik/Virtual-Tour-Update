// src/repositories/infoPoint.repository.js
import db from '../config/database.js';

const getAllInfoPoints = async (virtualTourId) => {
  try {
    const result = await db.query(`
      SELECT * FROM info_points 
      WHERE virtual_tour_id = $1
      ORDER BY created_at ASC
    `, [virtualTourId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error in getAllInfoPoints:', error);
    throw new Error('Gagal mengambil daftar info point');
  }
};

const getInfoPointById = async (id) => {
  try {
    const result = await db.query('SELECT * FROM info_points WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in getInfoPointById:', error);
    throw new Error('Gagal mengambil detail info point');
  }
};

const createInfoPoint = async (infoPointData) => {
  try {
    const result = await db.query(`
      INSERT INTO info_points (judul, deskripsi, image_path, pitch, yaw, virtual_tour_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      infoPointData.judul,
      infoPointData.deskripsi,
      infoPointData.image_path,
      infoPointData.pitch,
      infoPointData.yaw,
      infoPointData.virtual_tour_id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in createInfoPoint:', error);
    throw new Error('Gagal membuat info point baru');
  }
};

const updateInfoPoint = async (id, infoPointData) => {
  try {
    const result = await db.query(`
      UPDATE info_points 
      SET judul = $1, deskripsi = $2, image_path = $3, pitch = $4, yaw = $5
      WHERE id = $6
      RETURNING *
    `, [
      infoPointData.judul,
      infoPointData.deskripsi,
      infoPointData.image_path,
      infoPointData.pitch,
      infoPointData.yaw,
      id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateInfoPoint:', error);
    throw new Error('Gagal mengupdate info point');
  }
};

const deleteInfoPoint = async (id) => {
  try {
    const result = await db.query('DELETE FROM info_points WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteInfoPoint:', error);
    throw new Error('Gagal menghapus info point');
  }
};

export default {
  getAllInfoPoints,
  getInfoPointById,
  createInfoPoint,
  updateInfoPoint,
  deleteInfoPoint
};