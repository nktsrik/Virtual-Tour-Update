// src/routes/lokasi.route.js
import express from 'express';
import lokasiController from '../controllers/lokasi.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'thumbnail'
      ? path.resolve(__dirname, '../../uploads/thumbnails')
      : path.resolve(__dirname, '../../uploads/audio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Public routes
router.get('/', lokasiController.getAllLokasi);
router.get('/kategori/list', lokasiController.getKategoriLokasi); // Pindah ke atas agar tidak bentrok dengan /:id
router.get('/:id', lokasiController.getLokasiById);

// Protected routes (perlu login)
router.post('/', 
  authenticateToken, 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  lokasiController.createLokasi
);
router.put('/:id', 
  authenticateToken,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  lokasiController.updateLokasi
);
router.delete('/:id', authenticateToken, lokasiController.deleteLokasi);

export default router;