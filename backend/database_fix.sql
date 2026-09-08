-- Fix database structure untuk auth system
-- Jalankan script ini untuk memperbaiki struktur database

-- 1. Buat tabel roles jika belum ada
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(50) NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert data roles
INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'admin', 'Administrator sistem - Login via Google SSO (email whitelist)'),
(2, 'pengelola', 'Pengelola konten - Login via sistem (dibuat oleh admin)'),
(3, 'visitor', 'Pengunjung/Wisatawan - Login via Google SSO atau sistem')
ON CONFLICT (nama) DO NOTHING;

-- 3. Buat tabel refresh_tokens untuk JWT
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Alter tabel users untuk menambah role_id jika belum ada
DO $$ 
BEGIN
    -- Cek apakah kolom role_id sudah ada
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role_id') THEN
        -- Tambah kolom role_id
        ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) DEFAULT 3;
        
        -- Update existing users berdasarkan role string
        UPDATE users SET role_id = 1 WHERE role = 'admin';
        UPDATE users SET role_id = 2 WHERE role = 'pengelola';
        UPDATE users SET role_id = 3 WHERE role = 'visitor' OR role IS NULL;
        
        -- Set role_id sebagai NOT NULL setelah update
        ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
    END IF;
END $$;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 6. Reset sequence untuk roles
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));