-- Add alasan_penolakan column to virtual_tour table
ALTER TABLE virtual_tour 
ADD COLUMN IF NOT EXISTS alasan_penolakan TEXT;

-- Add comment for the column
COMMENT ON COLUMN virtual_tour.alasan_penolakan IS 'Alasan penolakan dari admin ketika virtual tour di-reject';