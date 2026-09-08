-- Migration: Buat tabel rencana_kunjungan
-- Jalankan file ini di database PostgreSQL

CREATE TABLE IF NOT EXISTS rencana_kunjungan (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tanggal DATE,                          -- nullable, diisi saat generate
  jam_mulai TIME,                        -- nullable, diisi saat generate
  jam_selesai TIME,                      -- nullable, diisi saat generate
  tipe_trip VARCHAR(20) DEFAULT 'solo',  -- nullable, diisi saat generate
  jumlah_orang INTEGER DEFAULT 1,        -- nullable, diisi saat generate
  catatan TEXT,
  lokasi_list JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rencana_kunjungan_user_id ON rencana_kunjungan(user_id);
