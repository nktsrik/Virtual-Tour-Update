-- Check if roles table exists and has data
SELECT * FROM roles;

-- If empty, insert roles data
INSERT INTO roles (id, nama, created_at) VALUES 
(1, 'admin', CURRENT_TIMESTAMP),
(2, 'pengelola', CURRENT_TIMESTAMP), 
(3, 'visitor', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Check users table structure
\d users;

-- Create pengelola user manually
INSERT INTO users (nama, email, password, role_id, created_at) 
VALUES (
  'Pengelola Test', 
  'pengelola@test.com', 
  '$2b$12$LQv3c1yqBwEHFuryHXkjVOaP69G2bDtUQmNVwYg2yuyCw6lnb/eWi', -- password: 123456
  2, -- role_id untuk pengelola
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Verify the user was created with role_name
SELECT u.*, r.nama AS role_name 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'pengelola@test.com';