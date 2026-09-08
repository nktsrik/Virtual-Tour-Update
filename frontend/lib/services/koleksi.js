import api from '../api';

export const koleksiService = {
  async getAllKoleksi() {
    const response = await api.get('/lokasi');
    return response.data;
  },

  async getKoleksiById(id) {
    const response = await api.get(`/lokasi/${id}`);
    return response.data;
  },

  async getKategori() {
    const response = await api.get('/lokasi/kategori/list');
    return response.data;
  },

  async createKoleksi(koleksiData) {
    // Kirim sebagai JSON, bukan FormData
    const response = await api.post('/lokasi', {
      nama: koleksiData.nama,
      deskripsi: koleksiData.deskripsi,
      kategori_id: parseInt(koleksiData.kategori_id),
      urutan: parseInt(koleksiData.urutan) || 0,
      status_id: 1 // Draft
    });
    return response.data;
  },

  async updateKoleksi(id, koleksiData) {
    // Kirim sebagai JSON, bukan FormData
    const response = await api.put(`/lokasi/${id}`, {
      nama: koleksiData.nama,
      deskripsi: koleksiData.deskripsi,
      kategori_id: parseInt(koleksiData.kategori_id),
      urutan: parseInt(koleksiData.urutan) || 0
    });
    return response.data;
  },

  async deleteKoleksi(id) {
    const response = await api.delete(`/lokasi/${id}`);
    return response.data;
  }
};