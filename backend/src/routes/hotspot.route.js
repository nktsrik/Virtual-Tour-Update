// src/routes/hotspot.route.js
import express from 'express';
import hotspotController from '../controllers/hotspot.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', hotspotController.getAllHotspots);
router.get('/:id', hotspotController.getHotspotById);

// Protected routes (perlu login)
router.post('/', authenticateToken, hotspotController.createHotspot);
router.put('/:id', authenticateToken, hotspotController.updateHotspot);
router.delete('/:id', authenticateToken, hotspotController.deleteHotspot);

export default router;