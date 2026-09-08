// src/routes/auth.routes.js
import express from 'express';
import authController from '../controllers/auth.controller.js';
import googleAuthController from '../controllers/googleAuth.controller.js';
import adminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', googleAuthController.googleLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// Admin only routes
router.post('/admin/create-pengelola', authenticateToken, adminController.createPengelola);
router.get('/admin/users', authenticateToken, adminController.getAllUsers);
router.put('/admin/users/:id/status', authenticateToken, adminController.toggleUserStatus);
router.delete('/admin/users/:id', authenticateToken, adminController.deleteUser);

export default router;