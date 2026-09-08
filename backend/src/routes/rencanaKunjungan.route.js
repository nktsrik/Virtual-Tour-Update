import express from 'express';
import rencanaKunjunganController from '../controllers/rencanaKunjungan.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, rencanaKunjunganController.create);
router.post('/lokasi', authenticateToken, rencanaKunjunganController.addLokasi);
router.delete('/lokasi/:lokasiId', authenticateToken, rencanaKunjunganController.removeLokasi);
router.get('/draft', authenticateToken, rencanaKunjunganController.getDraft);
router.get('/', authenticateToken, rencanaKunjunganController.getMyRencana);
router.get('/:id', authenticateToken, rencanaKunjunganController.getById);
router.delete('/:id', authenticateToken, rencanaKunjunganController.delete);

export default router;
