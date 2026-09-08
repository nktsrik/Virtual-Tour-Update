// src/repositories/auth.repository.js
import db from '../config/database.js';

const findByEmail = async (email) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.nama, u.email, u.password, u.role, u.role AS role_name, 
              u.telepon, u.alamat, u.image, u.google_id, u.is_active, u.created_at 
       FROM users u 
       WHERE u.email = $1`,
      [email]
    );
    console.log('findByEmail result:', result.rows[0]); // Debug log
    return result.rows[0];
  } catch (error) {
    console.error('Error in findByEmail:', error);
    throw new Error('Gagal mencari user berdasarkan email');
  }
};

const findById = async (id) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.nama, u.email, u.role, u.role AS role_name, 
              u.telepon, u.alamat, u.image, u.google_id, u.is_active, u.created_at 
       FROM users u 
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in findById:', error);
    throw new Error('Gagal mencari user berdasarkan ID');
  }
};

const create = async (userData) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const role = userData.role || 'visitor'; // Default role is visitor
    
    const result = await client.query(
      `INSERT INTO users (nama, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, nama, email, role, role AS role_name`,
      [userData.nama, userData.email, userData.password, role]
    );
    
    await client.query('COMMIT');
    
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in create:', error);
    throw new Error('Gagal membuat user baru');
  } finally {
    client.release();
  }
};

const saveRefreshToken = async (userId, refreshToken) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Delete existing refresh tokens for this user
    await client.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
    
    // Insert new refresh token
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days', CURRENT_TIMESTAMP)`,
      [userId, refreshToken]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in saveRefreshToken:', error);
    throw new Error('Gagal menyimpan refresh token');
  } finally {
    client.release();
  }
};

const findRefreshToken = async (refreshToken) => {
  try {
    const result = await db.query(
      `SELECT * FROM refresh_tokens 
       WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in findRefreshToken:', error);
    throw new Error('Gagal mencari refresh token');
  }
};

const updateRefreshToken = async (oldToken, newToken) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `UPDATE refresh_tokens 
       SET token = $1, expires_at = NOW() + INTERVAL '7 days', updated_at = CURRENT_TIMESTAMP
       WHERE token = $2
       RETURNING *`,
      [newToken, oldToken]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateRefreshToken:', error);
    throw new Error('Gagal memperbarui refresh token');
  } finally {
    client.release();
  }
};

const deleteRefreshToken = async (refreshToken) => {
  try {
    await db.query(
      `DELETE FROM refresh_tokens WHERE token = $1`,
      [refreshToken]
    );
  } catch (error) {
    console.error('Error in deleteRefreshToken:', error);
    throw new Error('Gagal menghapus refresh token');
  }
};

const updateGoogleId = async (userId, googleId) => {
  try {
    await db.query(
      `UPDATE users SET google_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [googleId, userId]
    );
  } catch (error) {
    console.error('Error in updateGoogleId:', error);
    throw new Error('Gagal update Google ID');
  }
};

const getAllUsers = async () => {
  const result = await db.query(
    `SELECT id, nama, email, role, is_active, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
};

const toggleUserStatus = async (id, is_active) => {
  const result = await db.query(
    `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nama, email, role, is_active`,
    [is_active, id]
  );
  if (!result.rows[0]) throw new Error('User tidak ditemukan');
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await db.query(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [id]
  );
  if (!result.rows[0]) throw new Error('User tidak ditemukan');
};

const saveResetToken = async (userId, token, expires) => {
  await db.query(
    `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
    [token, expires, userId]
  );
};

const findByResetToken = async (token) => {
  const result = await db.query(
    `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );
  return result.rows[0];
};

const updatePassword = async (userId, hashedPassword) => {
  await db.query(
    `UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [hashedPassword, userId]
  );
};

const updateProfile = async (userId, data) => {
  const result = await db.query(
    `UPDATE users SET nama = $1, telepon = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, nama, email, role, role AS role_name, telepon`,
    [data.nama, data.telepon || null, userId]
  );
  if (!result.rows[0]) throw new Error('User tidak ditemukan');
  return result.rows[0];
};

export default {
  findByEmail,
  findById,
  create,
  updateProfile,
  updateGoogleId,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  saveResetToken,
  findByResetToken,
  updatePassword,
  saveRefreshToken,
  findRefreshToken,
  updateRefreshToken,
  deleteRefreshToken
};