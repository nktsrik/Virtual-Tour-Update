-- Database setup script
-- Run this after creating the database

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    telepon VARCHAR(20),
    alamat TEXT,
    image VARCHAR(255),
    role VARCHAR(20) DEFAULT 'visitor',
    google_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kategori_lokasi (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lokasi (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    thumbnail VARCHAR(255),
    audio_path VARCHAR(255),
    urutan INTEGER DEFAULT 0,
    kategori_id INTEGER REFERENCES kategori_lokasi(id) ON DELETE SET NULL,
    status_id INTEGER REFERENCES status(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE virtual_tour (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    image_path VARCHAR(255) NOT NULL,
    pitch DECIMAL(5,2) DEFAULT 0,
    yaw DECIMAL(5,2) DEFAULT 0,
    hfov DECIMAL(5,2) DEFAULT 100,
    is_default BOOLEAN DEFAULT FALSE,
    lokasi_id INTEGER REFERENCES lokasi(id) ON DELETE CASCADE,
    status_id INTEGER REFERENCES status(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotspots (
    id SERIAL PRIMARY KEY,
    pitch DECIMAL(5,2) NOT NULL,
    yaw DECIMAL(5,2) NOT NULL,
    text VARCHAR(100),
    virtual_tour_id INTEGER REFERENCES virtual_tour(id) ON DELETE CASCADE,
    target_tour_id INTEGER REFERENCES virtual_tour(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE info_points (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    image_path VARCHAR(255),
    pitch DECIMAL(5,2) NOT NULL,
    yaw DECIMAL(5,2) NOT NULL,
    virtual_tour_id INTEGER REFERENCES virtual_tour(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO status (nama, deskripsi) VALUES
('draft', 'Konten baru dibuat, belum di-submit untuk review'),
('pending', 'Menunggu review dan approval dari admin'),
('published', 'Sudah disetujui admin dan tampil ke publik'),
('rejected', 'Ditolak admin, perlu perbaikan oleh pengelola');

INSERT INTO kategori_lokasi (nama, deskripsi) VALUES
('Taman Tematik', 'Taman dengan tema khusus seperti Taman Mawar, Taman Rhododendron, Taman Cyathea, Taman Anggrek, Taman Begonia'),
('Sudut Budaya', 'Area dengan nilai budaya seperti Patung Ramayana dan Patung Kumbakarna');

INSERT INTO users (nama, email, role, is_active) 
VALUES ('Srihati', 'admin@test.com', 'admin', TRUE);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_lokasi_kategori ON lokasi(kategori_id);
CREATE INDEX idx_lokasi_status ON lokasi(status_id);
CREATE INDEX idx_virtual_tour_lokasi ON virtual_tour(lokasi_id);
CREATE INDEX idx_hotspots_tour ON hotspots(virtual_tour_id);
CREATE INDEX idx_info_points_tour ON info_points(virtual_tour_id);