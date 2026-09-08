-- Insert sample data untuk testing

-- Insert lokasi
INSERT INTO lokasi (nama, deskripsi, urutan, kategori_id, status_id, created_by) VALUES
('Taman Mawar', 'Taman dengan koleksi berbagai jenis bunga mawar dari berbagai negara', 1, 1, 3, 1),
('Taman Rhododendron', 'Area koleksi tanaman Rhododendron dengan pemandangan indah', 2, 1, 3, 1),
('Taman Kaktus', 'Koleksi berbagai jenis kaktus dari berbagai daerah', 3, 1, 3, 1);

-- Insert virtual tour
INSERT INTO virtual_tour (nama, deskripsi, image_path, pitch, yaw, hfov, is_default, lokasi_id, status_id, created_by) VALUES
('Taman Mawar - Entrance', 'Pintu masuk Taman Mawar dengan pemandangan bunga yang indah', '/uploads/360/taman-mawar-entrance.jpg', 0, 0, 100, true, 1, 3, 1),
('Taman Rhododendron - Main Area', 'Area utama Taman Rhododendron', '/uploads/images360/img_1766380453341_ehmkt4.jpg', 0, 0, 100, true, 2, 3, 1),
('Taman Kaktus - Collection', 'Koleksi kaktus utama', '/uploads/images360/img_1766512493459_9q6qlz.jpg', 0, 0, 100, true, 3, 3, 1);
