// src/routes/galeri.route.js
import express from 'express';
import galeriController from '../controllers/galeri.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import uploadImage from '../utils/uploadimage.util.js';

const router = express.Router();

// Public routes (tidak perlu login) - HARUS di atas /:id
router.get('/published', galeriController.getPublishedGaleri);

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
router.get('/', authenticateToken, galeriController.getAllGaleri);
router.post('/', authenticateToken, handleUpload, galeriController.createGaleri);

// Submit & Review routes - HARUS sebelum /:id agar tidak tertangkap
router.post('/:id/submit', authenticateToken, galeriController.submitForReview);
router.post('/:id/approve', authenticateToken, galeriController.approveGaleri);
router.post('/:id/reject', authenticateToken, galeriController.rejectGaleri);
router.post('/:id/revise', authenticateToken, galeriController.reviseGaleri);

// Dynamic routes - HARUS paling bawah
router.get('/:id', galeriController.getGaleriById);
router.put('/:id', authenticateToken, galeriController.updateGaleri);
router.delete('/:id', authenticateToken, galeriController.deleteGaleri);

export default router;
