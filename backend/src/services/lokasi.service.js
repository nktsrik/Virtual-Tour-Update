// src/services/lokasi.service.js
import lokasiRepository from '../repositories/lokasi.repository.js';

const getAllLokasi = async (filters = {}) => {
  return await lokasiRepository.getAllLokasi(filters);
};

const getLokasiById = async (id) => {
  const lokasi = await lokasiRepository.getLokasiById(id);
  if (!lokasi) {
    throw new Error('Lokasi tidak ditemukan');
  }
  return lokasi;
};

const createLokasi = async (lokasiData, userId) => {
  // Validasi input
  if (!lokasiData.nama || !lokasiData.kategori_id) {
    throw new Error('Nama dan kategori lokasi wajib diisi');
  }

  const newLokasi = await lokasiRepository.createLokasi({
    ...lokasiData,
    created_by: userId
  });

  return newLokasi;
};

const updateLokasi = async (id, lokasiData, userId, userRole) => {
  // Cek apakah lokasi exists
  const existingLokasi = await lokasiRepository.getLokasiById(id);
  if (!existingLokasi) {
    throw new Error('Lokasi tidak ditemukan');
  }

  const role = userRole?.toLowerCase();

  // Admin bisa update semua, pengelola hanya milik sendiri
  if (role !== 'admin' && existingLokasi.created_by !== userId) {
    throw new Error('Anda tidak memiliki akses untuk mengupdate lokasi ini');
  }

  const updatedLokasi = await lokasiRepository.updateLokasi(id, lokasiData);
  return updatedLokasi;
};

const deleteLokasi = async (id, userId, userRole) => {
  // Cek apakah lokasi exists
  const existingLokasi = await lokasiRepository.getLokasiById(id);
  if (!existingLokasi) {
    throw new Error('Lokasi tidak ditemukan');
  }

  // Admin bisa delete semua, Pengelola hanya bisa delete milik sendiri
  const role = userRole?.toLowerCase();
  
  if (role === 'admin') {
    // Admin bisa delete semua lokasi
    const deletedLokasi = await lokasiRepository.deleteLokasi(id);
    return deletedLokasi;
  } else if (role === 'pengelola') {
    // Pengelola hanya bisa delete lokasi yang mereka buat
    if (existingLokasi.created_by !== userId) {
      throw new Error('Anda tidak memiliki akses untuk menghapus lokasi ini. Hanya lokasi yang Anda buat sendiri yang bisa dihapus.');
    }
    const deletedLokasi = await lokasiRepository.deleteLokasi(id);
    return deletedLokasi;
  } else {
    throw new Error('Akses ditolak. Hanya admin dan pengelola yang dapat menghapus lokasi');
  }
};

const getKategoriLokasi = async () => {
  return await lokasiRepository.getKategoriLokasi();
};

export default {
  getAllLokasi,
  getLokasiById,
  createLokasi,
  updateLokasi,
  deleteLokasi,
  getKategoriLokasi
};