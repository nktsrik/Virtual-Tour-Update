import repo from '../repositories/infoPoint.repository.js';

const getAll = async (options = {}) => {
  return await repo.findAll(options);
};

const getById = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('ID tidak valid');
  }
  
  const data = await repo.findById(parseInt(id));
  if (!data) {
    throw new Error('Info point tidak ditemukan');
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
  if (!data.judul || data.judul.trim().length === 0) {
    throw new Error('Judul wajib diisi');
  }
  
  if (data.pitch == null || data.yaw == null) {
    throw new Error('Pitch dan yaw wajib diisi');
  }

  if (!data.virtual_tour_id || isNaN(parseInt(data.virtual_tour_id))) {
    throw new Error('Virtual tour ID wajib diisi dan harus berupa angka');
  }

  if (isNaN(parseFloat(data.pitch)) || isNaN(parseFloat(data.yaw))) {
    throw new Error('Pitch dan yaw harus berupa angka');
  }

  const sanitizedData = {
    judul: data.judul.trim(),
    deskripsi: data.deskripsi?.trim() || '',
    image_path: data.image_path || null,
    pitch: parseFloat(data.pitch),
    yaw: parseFloat(data.yaw),
    virtual_tour_id: parseInt(data.virtual_tour_id)
  };

  return await repo.create(sanitizedData);
};

const update = async (id, data) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('ID tidak valid');
  }
  
  const existing = await repo.findById(parseInt(id));
  if (!existing) {
    throw new Error('Info point tidak ditemukan');
  }
  
  const sanitizedData = {};
  
  if (data.judul !== undefined) {
    if (data.judul.trim().length === 0) {
      throw new Error('Judul tidak boleh kosong');
    }
    sanitizedData.judul = data.judul.trim();
  }
  
  if (data.deskripsi !== undefined) {
    sanitizedData.deskripsi = data.deskripsi.trim();
  }
  
  if (data.image_path !== undefined) {
    sanitizedData.image_path = data.image_path;
  }
  
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
  
  return await repo.update(parseInt(id), sanitizedData);
};

const remove = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error('ID tidak valid');
  }
  
  const existing = await repo.findById(parseInt(id));
  if (!existing) {
    throw new Error('Info point tidak ditemukan');
  }
  
  await repo.remove(parseInt(id));
  return { message: 'Info point berhasil dihapus' };
};

export default {
  getAll,
  getById,
  getByVirtualTour,
  create,
  update,
  remove,
};
