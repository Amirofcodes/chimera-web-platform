-- Create templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create template_downloads table for tracking downloads
CREATE TABLE IF NOT EXISTS template_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- Insert sample templates
INSERT INTO templates (id, name, description, category) VALUES
('php/nginx/mysql', 'PHP/Nginx/MySQL Stack', 'PHP development environment with Nginx web server and MySQL database', 'PHP Development'),
('php/nginx/postgresql', 'PHP/Nginx/PostgreSQL Stack', 'PHP development environment with Nginx web server and PostgreSQL database', 'PHP Development'),
('php/nginx/mariadb', 'PHP/Nginx/MariaDB Stack', 'PHP development environment with Nginx web server and MariaDB database', 'PHP Development'),
('fullstack/react-php/mysql-nginx', 'React/PHP/MySQL Fullstack Stack', 'Complete fullstack development environment with React, PHP backend, and MySQL database', 'Fullstack Development');