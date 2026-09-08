import api from '../api';

export const galeriService = {
  // Public: ambil galeri yang sudah published
  async getPublishedGaleri(lokasi_id = null) {
    const params = lokasi_id ? { lokasi_id } : {};
    const response = await api.get('/galeri/published', { params });
    return response.data;
  },

  // Protected: ambil semua galeri (untuk pengelola/admin)
  async getAllGaleri(filters = {}) {
    const response = await api.get('/galeri', { params: filters });
    return response.data;
  },

  async getGaleriById(id) {
    const response = await api.get(`/galeri/${id}`);
    return response.data;
  },

  async createGaleri(galeriData) {
    const formData = new FormData();
    formData.append('judul', galeriData.judul);
    formData.append('deskripsi', galeriData.deskripsi || '');
    if (galeriData.lokasi_id) formData.append('lokasi_id', galeriData.lokasi_id);
    formData.append('is_featured', galeriData.is_featured ? 'true' : 'false');
    formData.append('urutan', isNaN(galeriData.urutan) ? 0 : (galeriData.urutan || 0));
    formData.append('status_id', galeriData.status_id || 1);
    if (galeriData.tags) formData.append('tags', galeriData.tags);

    if (galeriData.image) {
      formData.append('image', galeriData.image);
    }

    const response = await api.post('/galeri', formData);
    return response.data;
  },

  async updateGaleri(id, galeriData) {
    const response = await api.put(`/galeri/${id}`, galeriData);
    return response.data;
  },

  async submitForReview(id) {
    const response = await api.post(`/galeri/${id}/submit`);
    return response.data;
  },

  async approveGaleri(id) {
    const response = await api.post(`/galeri/${id}/approve`);
    return response.data;
  },

  async rejectGaleri(id, alasan) {
    const response = await api.post(`/galeri/${id}/reject`, { alasan });
    return response.data;
  },

  async reviseGaleri(id, alasan) {
    const response = await api.post(`/galeri/${id}/revise`, { alasan });
    return response.data;
  },

  async deleteGaleri(id) {
    const response = await api.delete(`/galeri/${id}`);
    return response.data;
  },
};
