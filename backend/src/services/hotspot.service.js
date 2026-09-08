import repo from '../repositories/hotspot.repository.js';

const getAll = async (options = {}) => {
  return await repo.findAll(options);
};

const getById = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('ID tidak valid');
  }
  
  const data = await repo.findById(parseInt(id));
  if (!data) {
    throw new Error('Hotspot tidak ditemukan');
  }
  return data;
};

const getByVirtualTour = async (virtualTourId) => {
  if (!virtualTourId || isNaN(parseInt(virtualTourId))) {
    throw new Error('Virtual tour ID tidak valid');
  }
  
  return await repo.findByVirtualTour(parseInt(virtualTourId));
};

const create = async (data) => {
  if (data.pitch == null || data.yaw == null) {
    throw new Error('Pitch dan yaw wajib diisi');
  }
  
  if (!data.virtual_tour_id || isNaN(parseInt(data.virtual_tour_id))) {
    throw new Error('Virtual tour ID wajib diisi dan harus berupa angka');
  }

  if (isNaN(parseFloat(data.pitch)) || isNaN(parseFloat(data.yaw))) {
    throw new Error('Pitch dan yaw harus berupa angka');
  }

  if (data.target_tour_id && isNaN(parseInt(data.target_tour_id))) {
    throw new Error('Target tour ID harus berupa angka');
  }

  const sanitizedData = {
    pitch: parseFloat(data.pitch),
    yaw: parseFloat(data.yaw),
    text: data.text?.trim() || '',
    virtual_tour_id: parseInt(data.virtual_tour_id),
    target_tour_id: data.target_tour_id ? parseInt(data.target_tour_id) : null
  };

  return await repo.create(sanitizedData);
};

const update = async (id, data) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('ID tidak valid');
  }
  
  const existing = await repo.findById(parseInt(id));
  if (!existing) {
    throw new Error('Hotspot tidak ditemukan');
  }
  
  const sanitizedData = {};
  
  if (data.pitch !== undefined) {
    if (isNaN(parseFloat(data.pitch))) {
      throw new Error('Pitch harus berupa angka');
    }
    sanitizedData.pitch = parseFloat(data.pitch);
  }
  
  if (data.yaw !== undefined) {
    if (isNaN(parseFloat(data.yaw))) {
      throw new Error('Yaw harus berupa angka');
    }
    sanitizedData.yaw = parseFloat(data.yaw);
  }
  
  if (data.text !== undefined) {
    sanitizedData.text = data.text.trim();
  }
  
  if (data.target_tour_id !== undefined) {
    if (data.target_tour_id && isNaN(parseInt(data.target_tour_id))) {
      throw new Error('Target tour ID harus berupa angka');
    }
    sanitizedData.target_tour_id = data.target_tour_id ? parseInt(data.target_tour_id) : null;
  }
  
  return await repo.update(parseInt(id), sanitizedData);
};

const remove = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('ID tidak valid');
  }
  
  const existing = await repo.findById(parseInt(id));
  if (!existing) {
    throw new Error('Hotspot tidak ditemukan');
  }
  
  await repo.remove(parseInt(id));
  return { message: 'Hotspot berhasil dihapus' };
};

export default {
  getAll,
  getById,
  getByVirtualTour,
  create,
  update,
  remove,
};
