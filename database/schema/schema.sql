-- Ensure we use the correct database
USE `chimera-web-platform`;

-- Drop tables if they exist to start clean
DROP TABLE IF EXISTS `template_downloads`;
DROP TABLE IF EXISTS `templates`;
DROP TABLE IF EXISTS `users`;

-- Create users table
CREATE TABLE `users` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add to schema.sql
ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL;

-- Create password_reset_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create templates table
CREATE TABLE `templates` (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create template_downloads table
CREATE TABLE `template_downloads` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `users`(id),
    FOREIGN KEY (template_id) REFERENCES `templates`(id)
);

-- Insert test user (only if not exists)
INSERT IGNORE INTO `users` (email, password_hash, name)
VALUES ('test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User');

-- Insert sample templates (only if not exist)
INSERT IGNORE INTO `templates` (id, name, description, category) VALUES
('php/nginx/mysql', 'PHP/Nginx/MySQL Stack', 'PHP development environment with Nginx web server and MySQL database', 'PHP Development'),
('php/nginx/postgresql', 'PHP/Nginx/PostgreSQL Stack', 'PHP development environment with Nginx web server and PostgreSQL database', 'PHP Development'),
('php/nginx/mariadb', 'PHP/Nginx/MariaDB Stack', 'PHP development environment with Nginx web server and MariaDB database', 'PHP Development'),
('fullstack/react-php/mysql-nginx', 'React/PHP/MySQL Fullstack Stack', 'Complete fullstack development environment with React, PHP backend, and MySQL database', 'Fullstack Development');