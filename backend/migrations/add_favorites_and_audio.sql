-- Add audio_path column to virtual_tour table
ALTER TABLE virtual_tour 
ADD COLUMN IF NOT EXISTS audio_path VARCHAR(255);

-- Create favorites table for user likes
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    virtual_tour_id INTEGER NOT NULL REFERENCES virtual_tour(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, virtual_tour_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_virtual_tour_id ON favorites(virtual_tour_id);

-- Add likes_count column to virtual_tour for caching (optional, for performance)
ALTER TABLE virtual_tour 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
