import api from '../api';

export const rencanaKunjunganService = {
  async addLokasi(lokasiData) {
    const response = await api.post('/rencana-kunjungan/lokasi', lokasiData);
    return response.data;
  },

  async removeLokasi(lokasiId) {
    const response = await api.delete(`/rencana-kunjungan/lokasi/${lokasiId}`);
    return response.data;
  },

  async getDraft() {
    const response = await api.get('/rencana-kunjungan/draft');
    return response.data;
  },

  async simpan(data) {
    const response = await api.post('/rencana-kunjungan', data);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/rencana-kunjungan');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/rencana-kunjungan/${id}`);
    return response.data;
  },

  async hapus(id) {
    const response = await api.delete(`/rencana-kunjungan/${id}`);
    return response.data;
  }
};
