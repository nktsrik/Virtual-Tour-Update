-- Migration: tambah kolom koordinat peta interaktif pada tabel lokasi
ALTER TABLE lokasi ADD COLUMN IF NOT EXISTS map_x DECIMAL(6,2) DEFAULT NULL;
ALTER TABLE lokasi ADD COLUMN IF NOT EXISTS map_y DECIMAL(6,2) DEFAULT NULL;
ALTER TABLE lokasi ADD COLUMN IF NOT EXISTS gate_number VARCHAR(20) DEFAULT NULL;

-- Update data koordinat yang sudah ada berdasarkan nama lokasi
-- (sesuaikan nama dengan data yang ada di database)
UPDATE lokasi SET gate_number = 'Gate 1',  map_x = 24.98, map_y = 73.75 WHERE nama ILIKE '%gate%'       OR nama ILIKE '%utama%';
UPDATE lokasi SET gate_number = 'Gate 5',  map_x = 32.10, map_y = 58.47 WHERE nama ILIKE '%ramayana%';
UPDATE lokasi SET gate_number = 'Gate 7',  map_x = 33.98, map_y = 40.51 WHERE nama ILIKE '%kumbakarna%';
UPDATE lokasi SET gate_number = 'Gate 31', map_x = 41.32, map_y = 44.51 WHERE nama ILIKE '%mawar%';
UPDATE lokasi SET gate_number = 'Gate 12', map_x = 41.09, map_y = 34.11 WHERE nama ILIKE '%rhododendron%';
UPDATE lokasi SET gate_number = 'Gate 13', map_x = 47.35, map_y = 36.07 WHERE nama ILIKE '%chyatea%' OR nama ILIKE '%cyathea%';
UPDATE lokasi SET gate_number = 'Gate 26', map_x = 52.93, map_y = 40.58 WHERE nama ILIKE '%bambu%';
UPDATE lokasi SET gate_number = 'Gate 16', map_x = 38.53, map_y = 24.15 WHERE nama ILIKE '%kaktus%';
UPDATE lokasi SET gate_number = 'Gate 15', map_x = 45.82, map_y = 24.73 WHERE nama ILIKE '%anggrek%';
UPDATE lokasi SET gate_number = 'Gate 17', map_x = 41.89, map_y = 16.15 WHERE nama ILIKE '%akuatik%';
UPDATE lokasi SET gate_number = 'Gate 18', map_x = 49.12, map_y = 22.69 WHERE nama ILIKE '%usada%';
UPDATE lokasi SET gate_number = 'Gate 30', map_x = 38.02, map_y = 53.38 WHERE nama ILIKE '%begonia%';
