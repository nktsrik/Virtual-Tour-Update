// src/services/galeri.service.js
import galeriRepository from '../repositories/galeri.repository.js';

const getAllGaleri = async (filters = {}) => {
  return await galeriRepository.getAllGaleri(filters);
};

const getPublishedGaleri = async (filters = {}) => {
  return await galeriRepository.getPublishedGaleri(filters);
};

const getGaleriById = async (id) => {
  const galeri = await galeriRepository.getGaleriById(id);
  if (!galeri) {
    throw new Error('Galeri tidak ditemukan');
  }
  return galeri;
};

const createGaleri = async (galeriData, userId) => {
  if (!galeriData.judul) {
    throw new Error('Judul galeri wajib diisi');
  }

  if (!galeriData.file_path) {
    throw new Error('File gambar wajib diupload');
  }

  const newGaleri = await galeriRepository.createGaleri({
    ...galeriData,
    created_by: userId,
    status_id: galeriData.status_id || 1, // Default: draft
  });

  return newGaleri;
};

const updateGaleri = async (id, galeriData, userId, userRole) => {
  const existingGaleri = await galeriRepository.getGaleriById(id);
  if (!existingGaleri) {
    throw new Error('Galeri tidak ditemukan');
  }

  // Hanya creator atau admin yang bisa update
  const role = userRole?.toLowerCase();
  if (existingGaleri.created_by !== userId && role !== 'admin') {
    throw new Error('Anda tidak memiliki akses untuk mengupdate galeri ini');
  }

  const updatedGaleri = await galeriRepository.updateGaleri(id, galeriData);
  return updatedGaleri;
};

const submitForReview = async (id, userId) => {
  const existingGaleri = await galeriRepository.getGaleriById(id);
  if (!existingGaleri) {
    throw new Error('Galeri tidak ditemukan');
  }

  if (existingGaleri.created_by !== userId) {
    throw new Error('Anda tidak memiliki akses untuk submit galeri ini');
  }

  // Hanya draft (1) atau rejected (4) yang bisa disubmit
  if (existingGaleri.status_id !== 1 && existingGaleri.status_id !== 4) {
    throw new Error('Hanya galeri dengan status draft atau ditolak yang dapat disubmit');
  }

  return await galeriRepository.updateGaleriStatus(id, 2); // 2 = pending
};

const approveGaleri = async (id) => {
  const existingGaleri = await galeriRepository.getGaleriById(id);
  if (!existingGaleri) {
    throw new Error('Galeri tidak ditemukan');
  }

  if (existingGaleri.status_id !== 2) {
    throw new Error('Hanya galeri dengan status pending yang dapat disetujui');
  }

  return await galeriRepository.updateGaleriStatus(id, 3); // 3 = published
};

const rejectGaleri = async (id, alasan) => {
  const existingGaleri = await galeriRepository.getGaleriById(id);
  if (!existingGaleri) {
    throw new Error('Galeri tidak ditemukan');
  }

  if (existingGaleri.status_id !== 2) {
    throw new Error('Hanya galeri dengan status pending yang dapat ditolak');
  }

  if (!alasan) {
    throw new Error('Alasan penolakan wajib diisi');
  }

  return await galeriRepository.updateGaleriStatus(id, 4, alasan); // 4 = rejected
};

const reviseGaleri = async (id, alasan) => {
  const existingGaleri = await galeriRepository.getGaleriById(id);
  if (!existingGaleri) {
    throw new Error('Galeri tidak ditemukan');
  }

  if (existingGaleri.status_id !== 2) {
    throw new Error('Hanya galeri dengan status pending yang dapat diminta perbaikan');
  }

  if (!alasan) {
    throw new Error('Catatan perbaikan wajib diisi');
  }

  return await galeriRepository.updateGaleriStatus(id, 1, alasan); // 1 = draft
};

const deleteGaleri = async (id, userId, userRole) => {
  const existingGaleri = await galeriRepository.getGaleriById(id);
  if (!existingGaleri) {
    throw new Error('Galeri tidak ditemukan');
  }

  const role = userRole?.toLowerCase();

  // Admin bisa hapus semua galeri
  // Pengelola hanya bisa hapus galerinya sendiri yang berstatus draft (1) atau ditolak (4)
  if (role !== 'admin') {
    if (existingGaleri.created_by !== userId) {
      throw new Error('Anda tidak memiliki akses untuk menghapus galeri ini');
    }
    if (existingGaleri.status_id !== 1 && existingGaleri.status_id !== 4) {
      throw new Error('Galeri hanya dapat dihapus jika berstatus Draft atau Ditolak');
    }
  }

  return await galeriRepository.deleteGaleri(id);
};

export default {
  getAllGaleri,
  getPublishedGaleri,
  getGaleriById,
  createGaleri,
  updateGaleri,
  submitForReview,
  approveGaleri,
  rejectGaleri,
  reviseGaleri,
  deleteGaleri,
};
