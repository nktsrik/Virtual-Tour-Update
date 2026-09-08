import api from '../api';

export const virtualTourService = {
  async getAllTours() {
    const response = await api.get('/virtual-tour');
    return response.data;
  },

  async getPublishedTours() {
    const response = await api.get('/virtual-tour/published/list');
    return response.data;
  },

  async getTourById(id) {
    const response = await api.get(`/virtual-tour/${id}`);
    return response.data;
  },

  async createTour(tourData) {
    console.log('Creating tour with data:', tourData);
    
    const formData = new FormData();
    formData.append('nama', tourData.title);
    formData.append('deskripsi', tourData.description);
    formData.append('lokasi_id', tourData.lokasi_id || 1);
    formData.append('urutan', tourData.urutan || 1);
    formData.append('pitch', tourData.pitch || 0);
    formData.append('yaw', tourData.yaw || 0);
    formData.append('hfov', tourData.hfov || 100);
    
    if (tourData.image) {
      formData.append('image', tourData.image);
      console.log('Image file:', tourData.image.name, tourData.image.type);
    } else {
      console.log('No image file provided');
    }
    
    // Debug FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    try {
      const response = await api.post('/virtual-tour', formData);
      return response.data;
    } catch (error) {
      console.error('Backend error response:', error.response?.data);
      console.error('Backend error status:', error.response?.status);
      throw error;
    }
  },

  async updateTour(id, tourData) {
    console.log('Updating tour ID:', id, 'with data:', tourData);
    
    const formData = new FormData();
    formData.append('nama', tourData.title);
    formData.append('deskripsi', tourData.description);
    formData.append('lokasi_id', tourData.lokasi_id || 1);
    formData.append('urutan', tourData.urutan || 1);
    formData.append('pitch', tourData.pitch || 0);
    formData.append('yaw', tourData.yaw || 0);
    formData.append('hfov', tourData.hfov || 100);
    
    if (tourData.image) {
      formData.append('image', tourData.image);
      console.log('Image file for update:', tourData.image.name, tourData.image.type);
    }
    
    // Debug FormData contents
    for (let [key, value] of formData.entries()) {
      console.log('Update FormData:', key, value);
    }
    
    try {
      const response = await api.put(`/virtual-tour/${id}`, formData);
      console.log('Update success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update backend error response:', error.response?.data);
      console.error('Update backend error status:', error.response?.status);
      console.error('Update full error:', error);
      throw error;
    }
  },

  async deleteTour(id) {
    const response = await api.delete(`/virtual-tour/${id}`);
    return response.data;
  },

  // Submit virtual tour untuk review (pengelola)
  async submitForReview(id) {
    const response = await api.post(`/virtual-tour/${id}/submit`);
    return response.data;
  },

  // Approve virtual tour (admin)
  async approveTour(id) {
    const response = await api.post(`/virtual-tour/${id}/approve`);
    return response.data;
  },

  // Reject virtual tour (admin) - ditolak permanen
  async rejectTour(id, alasan) {
    const response = await api.post(`/virtual-tour/${id}/reject`, { alasan });
    return response.data;
  },

  // Minta perbaikan/revisi virtual tour (admin) - dikembalikan ke draft
  async reviseTour(id, alasan) {
    const response = await api.post(`/virtual-tour/${id}/revise`, { alasan });
    return response.data;
  },

  // Get pending virtual tours (admin)
  async getPendingTours() {
    const response = await api.get('/virtual-tour/pending/list');
    return response.data;
  }
};
