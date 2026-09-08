import rencanaKunjunganService from '../services/rencanaKunjungan.service.js';

const rencanaKunjunganController = {
  async create(req, res) {
    try {
      const userId = req.user?.id;
      const result = await rencanaKunjunganService.create(userId, req.body);
      res.status(201).json({ success: true, message: 'Rencana kunjungan berhasil disimpan', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async addLokasi(req, res) {
    try {
      const userId = req.user?.id;
      const result = await rencanaKunjunganService.addLokasi(userId, req.body);
      res.json({ success: true, message: 'Lokasi ditambahkan ke rencana', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async removeLokasi(req, res) {
    try {
      const userId = req.user?.id;
      await rencanaKunjunganService.removeLokasi(userId, parseInt(req.params.lokasiId));
      res.json({ success: true, message: 'Lokasi dihapus dari rencana' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getDraft(req, res) {
    try {
      const userId = req.user?.id;
      const result = await rencanaKunjunganService.getDraft(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getMyRencana(req, res) {
    try {
      const userId = req.user?.id;
      const result = await rencanaKunjunganService.getByUser(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const userId = req.user?.id;
      const result = await rencanaKunjunganService.getById(req.params.id, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const userId = req.user?.id;
      await rencanaKunjunganService.delete(req.params.id, userId);
      res.json({ success: true, message: 'Rencana kunjungan berhasil dihapus' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
};

export default rencanaKunjunganController;
