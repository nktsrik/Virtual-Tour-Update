// src/routes/infoPoint.route.js
import express from 'express';
import infoPointController from '../controllers/infoPoint.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', infoPointController.getAllInfoPoints);
router.get('/:id', infoPointController.getInfoPointById);

// Protected routes (perlu login)
router.post('/', authenticateToken, infoPointController.createInfoPoint);
router.put('/:id', authenticateToken, infoPointController.updateInfoPoint);
router.delete('/:id', authenticateToken, infoPointController.deleteInfoPoint);

export default router;