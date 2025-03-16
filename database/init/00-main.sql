-- Ensure files are executed in the correct order
SOURCE /docker-entrypoint-initdb.d/init.sql;
SOURCE /docker-entrypoint-initdb.d/users.sql;
SOURCE /docker-entrypoint-initdb.d/templates.sql;