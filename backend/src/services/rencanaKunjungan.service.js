import rencanaKunjunganRepository from '../repositories/rencanaKunjungan.repository.js';

const rencanaKunjunganService = {
  async create(userId, data) {
    if (!userId) throw new Error('User harus login');
    if (!data.lokasi_list || data.lokasi_list.length === 0) throw new Error('Minimal 1 lokasi dipilih');
    return await rencanaKunjunganRepository.create(userId, data);
  },

  async addLokasi(userId, lokasiData) {
    if (!userId) throw new Error('User harus login');
    if (!lokasiData.lokasiId) throw new Error('Lokasi ID diperlukan');
    return await rencanaKunjunganRepository.addLokasi(userId, lokasiData);
  },

  async removeLokasi(userId, lokasiId) {
    if (!userId) throw new Error('User harus login');
    return await rencanaKunjunganRepository.removeLokasi(userId, lokasiId);
  },

  async getDraft(userId) {
    if (!userId) throw new Error('User harus login');
    return await rencanaKunjunganRepository.getDraft(userId);
  },

  async getByUser(userId) {
    if (!userId) throw new Error('User harus login');
    return await rencanaKunjunganRepository.getByUser(userId);
  },

  async getById(id, userId) {
    if (!userId) throw new Error('User harus login');
    const rencana = await rencanaKunjunganRepository.getById(id, userId);
    if (!rencana) throw new Error('Rencana kunjungan tidak ditemukan');
    return rencana;
  },

  async delete(id, userId) {
    if (!userId) throw new Error('User harus login');
    const rencana = await rencanaKunjunganRepository.delete(id, userId);
    if (!rencana) throw new Error('Rencana kunjungan tidak ditemukan');
    return rencana;
  }
};

export default rencanaKunjunganService;
