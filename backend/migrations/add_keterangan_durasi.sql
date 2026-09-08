-- Migration: tambah kolom keterangan_durasi pada tabel lokasi
ALTER TABLE lokasi ADD COLUMN IF NOT EXISTS keterangan_durasi TEXT DEFAULT NULL;
