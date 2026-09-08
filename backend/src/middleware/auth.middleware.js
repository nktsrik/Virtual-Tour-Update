// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/auth.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token diperlukan'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Decoded token:', decoded);
    
    // Verify user still exists
    const user = await authRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    console.log('User from DB:', user);
    console.log('User role from DB:', user.role);
    console.log('User role type:', typeof user.role);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role, // String role from database (admin, pengelola, visitor)
      role_id: user.role_id, // Numeric role ID if exists for backward compatibility
      nama: user.nama
    };
    
    console.log('Final req.user:', req.user);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token sudah expired' : 'Token tidak valid'
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi'
      });
    }

    // Check role (string-based)
    const userRole = req.user.role?.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role Anda: ${req.user.role}. Role yang diizinkan: ${roles.join(', ')}`
      });
    }

    next();
  };
};

export { authenticateToken, authorizeRoles };