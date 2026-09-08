-- Update likes_count untuk semua virtual tour berdasarkan data favorites yang sudah ada
UPDATE virtual_tour 
SET likes_count = (
    SELECT COUNT(*) 
    FROM favorites 
    WHERE favorites.virtual_tour_id = virtual_tour.id
);