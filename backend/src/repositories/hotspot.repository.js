// src/repositories/hotspot.repository.js
import db from '../config/database.js';

const getAllHotspots = async (virtualTourId) => {
  try {
    const result = await db.query(`
      SELECT h.*, vt_target.nama AS target_tour_nama
      FROM hotspots h
      LEFT JOIN virtual_tour vt_target ON h.target_tour_id = vt_target.id
      WHERE h.virtual_tour_id = $1
      ORDER BY h.created_at ASC
    `, [virtualTourId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error in getAllHotspots:', error);
    throw new Error('Gagal mengambil daftar hotspot');
  }
};

const getHotspotById = async (id) => {
  try {
    const result = await db.query(`
      SELECT h.*, vt_target.nama AS target_tour_nama
      FROM hotspots h
      LEFT JOIN virtual_tour vt_target ON h.target_tour_id = vt_target.id
      WHERE h.id = $1
    `, [id]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in getHotspotById:', error);
    throw new Error('Gagal mengambil detail hotspot');
  }
};

const createHotspot = async (hotspotData) => {
  try {
    const result = await db.query(`
      INSERT INTO hotspots (pitch, yaw, text, virtual_tour_id, target_tour_id, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      hotspotData.pitch,
      hotspotData.yaw,
      hotspotData.text,
      hotspotData.virtual_tour_id,
      hotspotData.target_tour_id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in createHotspot:', error);
    throw new Error('Gagal membuat hotspot baru');
  }
};

const updateHotspot = async (id, hotspotData) => {
  try {
    const result = await db.query(`
      UPDATE hotspots 
      SET pitch = $1, yaw = $2, text = $3, target_tour_id = $4
      WHERE id = $5
      RETURNING *
    `, [
      hotspotData.pitch,
      hotspotData.yaw,
      hotspotData.text,
      hotspotData.target_tour_id,
      id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateHotspot:', error);
    throw new Error('Gagal mengupdate hotspot');
  }
};

const deleteHotspot = async (id) => {
  try {
    const result = await db.query('DELETE FROM hotspots WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteHotspot:', error);
    throw new Error('Gagal menghapus hotspot');
  }
};

export default {
  getAllHotspots,
  getHotspotById,
  createHotspot,
  updateHotspot,
  deleteHotspot
};