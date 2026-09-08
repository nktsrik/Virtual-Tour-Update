-- ========================================
-- Migration: Add urutan column to virtual_tour
-- Purpose: Enable photo ordering within a location
-- Date: 26 Desember 2024
-- ========================================

-- 1. Add urutan column for photo ordering
ALTER TABLE virtual_tour 
ADD COLUMN IF NOT EXISTS urutan INTEGER DEFAULT 0;

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_virtual_tour_lokasi 
ON virtual_tour(lokasi_id);

CREATE INDEX IF NOT EXISTS idx_virtual_tour_urutan 
ON virtual_tour(lokasi_id, urutan);

-- 3. Update existing data to have sequential order
-- Photos will be ordered by creation date (oldest first)
WITH ranked AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lokasi_id 
      ORDER BY created_at ASC
    ) as row_num
  FROM virtual_tour
  WHERE lokasi_id IS NOT NULL
)
UPDATE virtual_tour vt
SET urutan = r.row_num
FROM ranked r
WHERE vt.id = r.id;

-- 4. Set default urutan for photos without lokasi_id
UPDATE virtual_tour 
SET urutan = 1 
WHERE urutan = 0 AND lokasi_id IS NULL;

-- 5. Verify migration (optional - view results)
SELECT 
  l.nama as lokasi_nama,
  vt.lokasi_id,
  COUNT(*) as total_photos,
  MIN(vt.urutan) as min_order,
  MAX(vt.urutan) as max_order,
  array_agg(vt.nama ORDER BY vt.urutan) as photo_names
FROM virtual_tour vt
LEFT JOIN lokasi l ON vt.lokasi_id = l.id
WHERE vt.lokasi_id IS NOT NULL
GROUP BY l.nama, vt.lokasi_id
ORDER BY vt.lokasi_id;

-- Expected output example:
-- lokasi_nama   | lokasi_id | total_photos | min_order | max_order | photo_names
-- --------------|-----------|--------------|-----------|-----------|-------------
-- Taman Mawar   | 10        | 5            | 1         | 5         | {Photo1, Photo2, ...}
-- Taman Anggrek | 11        | 3            | 1         | 3         | {Photo1, Photo2, ...}
