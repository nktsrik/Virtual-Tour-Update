// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import virtualTourRoutes from './routes/virtualTour.route.js';
import infoPointRoutes from './routes/infoPoint.route.js';
import lokasiRoutes from './routes/lokasi.route.js';
import authRoutes from './routes/auth.routes.js';
import galeriRoutes from './routes/galeri.route.js';
import rencanaKunjunganRoutes from './routes/rencanaKunjungan.route.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware - Increased limits for 360° images
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files dengan CORS yang lebih permissive untuk images
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(uploadsDir, {
  dotfiles: 'deny',
  index: false,
  redirect: false,
  setHeaders: (res, path) => {
    // Set cache headers untuk images
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/virtual-tour', virtualTourRoutes);
app.use('/api/info-point', infoPointRoutes);
app.use('/api/lokasi', lokasiRoutes);
app.use('/api/galeri', galeriRoutes);
app.use('/api/kategori-lokasi', lokasiRoutes);
app.use('/api/rencana-kunjungan', rencanaKunjunganRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File terlalu besar. Maksimal 50MB untuk gambar 360°'
    });
  }
  
  // Handle Multer file type errors
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Tipe file tidak didukung'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
