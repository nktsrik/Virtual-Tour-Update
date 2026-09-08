import api from '../api';

export const lokasiService = {
  async getAllLokasi(filters = {}) {
    const params = new URLSearchParams();
    if (filters.kategori_id) params.append('kategori_id', filters.kategori_id);
    if (filters.status_id) params.append('status_id', filters.status_id);
    const response = await api.get(`/lokasi?${params.toString()}`);
    return response.data;
  },

  async getLokasiById(id) {
    const response = await api.get(`/lokasi/${id}`);
    return response.data;
  },

  // Fetch lokasi yang punya koordinat peta (untuk InteractiveMap)
  // Ambil semua lokasi yang punya koordinat, tampil di peta jika VR-nya sudah published
  async getLokasiForMap() {
    const response = await api.get('/lokasi');
    const allLokasi = response.data?.data || [];
    return allLokasi.filter(l => l.map_x !== null && l.map_y !== null);
  },
};
