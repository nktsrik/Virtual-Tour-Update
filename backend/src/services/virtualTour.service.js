// src/services/virtualTour.service.js
import virtualTourRepository from '../repositories/virtualTour.repository.js';

const getAllVirtualTours = async (filters = {}) => {
  return await virtualTourRepository.getAllVirtualTours(filters);
};

const getVirtualTourById = async (id) => {
  const tour = await virtualTourRepository.getVirtualTourById(id);
  if (!tour) {
    throw new Error('Virtual tour tidak ditemukan');
  }
  return tour;
};

const createVirtualTour = async (tourData, userId) => {
  // Validasi input
  if (!tourData.nama || !tourData.lokasi_id) {
    throw new Error('Nama dan lokasi wajib diisi');
  }

  const newTour = await virtualTourRepository.createVirtualTour({
    ...tourData,
    created_by: userId
  });

  return newTour;
};

const updateVirtualTour = async (id, tourData, userId, userRole) => {
  // Cek apakah tour exists
  const existingTour = await virtualTourRepository.getVirtualTourById(id);
  if (!existingTour) {
    throw new Error('Virtual tour tidak ditemukan');
  }

  // Validasi permission (hanya creator atau admin yang bisa update)
  const role = userRole?.toLowerCase();
  if (existingTour.created_by !== userId && role !== 'admin') {
    throw new Error('Anda tidak memiliki akses untuk mengupdate virtual tour ini');
  }

  const updatedTour = await virtualTourRepository.updateVirtualTour(id, tourData);
  return updatedTour;
};

const deleteVirtualTour = async (id, userId, userRole) => {
  // Cek apakah tour exists
  const existingTour = await virtualTourRepository.getVirtualTourById(id);
  if (!existingTour) {
    throw new Error('Virtual tour tidak ditemukan');
  }

  // Hanya admin yang bisa delete
  const role = userRole?.toLowerCase();
  if (role !== 'admin') {
    throw new Error('Hanya admin yang dapat menghapus virtual tour');
  }

  const deletedTour = await virtualTourRepository.deleteVirtualTour(id);
  return deletedTour;
};

// Submit virtual tour untuk review
const submitForReview = async (id, userId) => {
  console.log(`Submit for review - Tour ID: ${id}, User ID: ${userId}`);
  
  // Cek apakah tour exists
  const existingTour = await virtualTourRepository.getVirtualTourById(id);
  if (!existingTour) {
    throw new Error('Virtual tour tidak ditemukan');
  }

  console.log('Existing tour:', existingTour);

  // Validasi: hanya creator yang bisa submit
  if (existingTour.created_by !== userId) {
    throw new Error('Anda tidak memiliki akses untuk submit virtual tour ini');
  }

  // Validasi: hanya draft atau rejected yang bisa disubmit
  if (existingTour.status_id !== 1 && existingTour.status_id !== 4) {
    throw new Error('Hanya virtual tour dengan status draft atau rejected yang dapat disubmit untuk review');
  }

  // Update status ke pending (2)
  const updatedTour = await virtualTourRepository.updateVirtualTourStatus(id, 2);
  console.log('Tour submitted for review:', updatedTour);
  return updatedTour;
};

// Approve virtual tour (admin)
const approveVirtualTour = async (id) => {
  console.log(`Approve virtual tour - Tour ID: ${id}`);
  
  // Cek apakah tour exists
  const existingTour = await virtualTourRepository.getVirtualTourById(id);
  if (!existingTour) {
    throw new Error('Virtual tour tidak ditemukan');
  }

  console.log('Existing tour:', existingTour);

  // Validasi: hanya pending yang bisa diapprove
  if (existingTour.status_id !== 2) {
    throw new Error('Hanya virtual tour dengan status pending yang dapat disetujui');
  }

  // Update status ke published (3)
  const updatedTour = await virtualTourRepository.updateVirtualTourStatus(id, 3);
  console.log('Tour approved and published:', updatedTour);
  return updatedTour;
};

// Reject virtual tour (admin)
const rejectVirtualTour = async (id, alasan) => {
  console.log(`Reject virtual tour - Tour ID: ${id}, Reason: ${alasan}`);
  
  // Cek apakah tour exists
  const existingTour = await virtualTourRepository.getVirtualTourById(id);
  if (!existingTour) {
    throw new Error('Virtual tour tidak ditemukan');
  }

  console.log('Existing tour:', existingTour);

  // Validasi: hanya pending yang bisa direject
  if (existingTour.status_id !== 2) {
    throw new Error('Hanya virtual tour dengan status pending yang dapat ditolak');
  }

  // Update status ke rejected (4) dan simpan alasan penolakan
  const updatedTour = await virtualTourRepository.rejectVirtualTour(id, alasan);
  console.log('Tour rejected:', updatedTour);
  return updatedTour;
};

// Get pending virtual tours
const getPendingVirtualTours = async () => {
  return await virtualTourRepository.getAllVirtualTours({ status_id: 2 });
};

const getPublishedVirtualTours = async () => {
  return await virtualTourRepository.getPublishedVirtualTours();
};

export default {
  getAllVirtualTours,
  getPublishedVirtualTours,
  getVirtualTourById,
  createVirtualTour,
  updateVirtualTour,
  deleteVirtualTour,
  submitForReview,
  approveVirtualTour,
  rejectVirtualTour,
  getPendingVirtualTours
};