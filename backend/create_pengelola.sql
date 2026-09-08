-- Insert pengelola user for testing
INSERT INTO users (nama, email, password, role_id, created_at) 
VALUES (
  'Pengelola Test', 
  'pengelola@test.com', 
  '$2b$12$LQv3c1yqBwEHFuryHXkjVOaP69G2bDtUQmNVwYg2yuyCw6lnb/eWi', -- password: 123456
  2, -- role_id untuk pengelola
  CURRENT_TIMESTAMP
);