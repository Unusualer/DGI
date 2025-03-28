-- Insert default users with BCrypt-encoded passwords
-- All users have password: 'password'
INSERT INTO users (username, email, password, role) 
VALUES 
('admin', 'admin@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_ADMIN'),
('manager', 'manager@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_MANAGER'),
('processing', 'processing@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_PROCESSING'),
('frontdesk', 'frontdesk@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_FRONTDESK'); 