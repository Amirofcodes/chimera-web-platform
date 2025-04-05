-- This SQL script initializes the test database for integration tests.
-- It drops existing tables (if any), creates the required tables,
-- and inserts sample data into the templates table.

----------------------------------------------------------
-- DROP EXISTING TABLES
----------------------------------------------------------
-- Remove the table for template downloads if it exists.
DROP TABLE IF EXISTS template_downloads;

-- Remove the payments table if it exists.
DROP TABLE IF EXISTS payments;

-- Remove the password reset tokens table if it exists.
DROP TABLE IF EXISTS password_reset_tokens;

-- Remove the templates table if it exists.
DROP TABLE IF EXISTS templates;

-- Remove the users table if it exists.
DROP TABLE IF EXISTS users;

----------------------------------------------------------
-- CREATE TABLES
----------------------------------------------------------
-- Create the 'users' table.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,           -- Unique user identifier.
    email VARCHAR(255) NOT NULL UNIQUE,            -- User email; must be unique.
    password_hash VARCHAR(255) NOT NULL,           -- Hashed password.
    name VARCHAR(255),                             -- Optional user name.
    profile_image VARCHAR(255) NULL,               -- Optional URL for the profile image.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of user creation.
);

-- Create the 'password_reset_tokens' table.
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier for the reset token.
    user_id INT NOT NULL,                          -- References the user ID.
    token VARCHAR(64) NOT NULL UNIQUE,             -- Unique token for password reset.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the token was created.
    expires_at TIMESTAMP NOT NULL,                 -- Expiration time for the token.
    used BOOLEAN DEFAULT 0,                        -- Flag to mark if the token has been used.
    FOREIGN KEY (user_id) REFERENCES users(id)     -- Foreign key linking to the 'users' table.
);

-- Create the 'templates' table.
CREATE TABLE templates (
    id VARCHAR(255) PRIMARY KEY,                   -- Template identifier.
    name VARCHAR(255) NOT NULL,                     -- Name of the template.
    description TEXT,                              -- Description of the template.
    category VARCHAR(100),                         -- Category for the template.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of template creation.
);

-- Create the 'template_downloads' table.
CREATE TABLE template_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier for each download record.
    user_id INT NOT NULL,                          -- ID of the user who downloaded the template.
    template_id VARCHAR(255) NOT NULL,              -- ID of the downloaded template.
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the download occurred.
    FOREIGN KEY (user_id) REFERENCES users(id),     -- Foreign key linking to the 'users' table.
    FOREIGN KEY (template_id) REFERENCES templates(id) -- Foreign key linking to the 'templates' table.
);

-- Create the 'payments' table.
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier for each payment record.
    user_id INT NOT NULL,                          -- ID of the user making the payment.
    payment_method VARCHAR(20) NOT NULL,           -- Payment method (e.g., stripe, paypal).
    amount DECIMAL(10,2) NOT NULL,                  -- Amount paid in USD.
    status VARCHAR(20) NOT NULL,                    -- Status of the payment (e.g., initiated, completed).
    tier_name VARCHAR(100) NOT NULL,                -- Donation tier name.
    external_payment_id VARCHAR(255) NOT NULL,      -- External payment ID from the payment gateway.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the payment was created.
    updated_at TIMESTAMP NULL,                      -- Timestamp when the payment was last updated.
    FOREIGN KEY (user_id) REFERENCES users(id)      -- Foreign key linking to the 'users' table.
);

----------------------------------------------------------
-- INSERT SAMPLE TEST DATA
----------------------------------------------------------
-- Insert test data into the 'templates' table.
INSERT INTO templates (id, name, description, category) VALUES
('php/nginx/mysql', 'PHP/Nginx/MySQL Stack', 'PHP development environment with Nginx web server and MySQL database', 'PHP Development'),
('php/nginx/postgresql', 'PHP/Nginx/PostgreSQL Stack', 'PHP development environment with Nginx web server and PostgreSQL database', 'PHP Development'),
('php/nginx/mariadb', 'PHP/Nginx/MariaDB Stack', 'PHP development environment with Nginx web server and MariaDB database', 'PHP Development'),
('fullstack/react-php/mysql-nginx', 'React/PHP/MySQL Fullstack Stack', 'Complete fullstack development environment with React, PHP backend, and MySQL database', 'Fullstack Development');
