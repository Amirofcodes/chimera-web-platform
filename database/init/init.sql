-- Create developer user
CREATE USER IF NOT EXISTS 'developer'@'%' IDENTIFIED BY 'devpassword';
GRANT ALL PRIVILEGES ON exampledb.* TO 'developer'@'%';
FLUSH PRIVILEGES;

-- Other tables can go here, but not users