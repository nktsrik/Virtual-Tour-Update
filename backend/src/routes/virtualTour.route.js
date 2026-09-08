// src/routes/virtualTour.route.js
import express from 'express';
import virtualTourController from '../controllers/virtualTour.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import uploadImage from '../utils/uploadimage.util.js';

const router = express.Router();

// Public routes
router.get('/', virtualTourController.getAllVirtualTours);
router.get('/published/list', virtualTourController.getPublishedVirtualTours); // Public: Get only published tours

// Protected routes - specific paths MUST come before dynamic params
router.get('/pending/list', authenticateToken, virtualTourController.getPendingVirtualTours); // Admin get pending list

// Wrapper untuk menangani error dari multer
const handleUpload = (req, res, next) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Protected routes (perlu login)
router.post('/', authenticateToken, handleUpload, virtualTourController.createVirtualTour);
router.put('/:id', authenticateToken, handleUpload, virtualTourController.updateVirtualTour);
router.delete('/:id', authenticateToken, virtualTourController.deleteVirtualTour);

// Workflow routes
router.post('/:id/submit', authenticateToken, virtualTourController.submitForReview); // Pengelola submit for review
router.post('/:id/approve', authenticateToken, virtualTourController.approveVirtualTour);
router.post('/:id/reject', authenticateToken, virtualTourController.rejectVirtualTour);
router.post('/:id/revise', authenticateToken, virtualTourController.reviseVirtualTour);

// Dynamic ID route - MUST be last to avoid conflicts
router.get('/:id', virtualTourController.getVirtualTourById);

export default router;