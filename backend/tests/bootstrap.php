<?php

/**
 * Bootstrap file for setting up the test environment.
 *
 * This file loads Composer's autoloader, configures environment variables required for testing,
 * and initializes the test database by executing an SQL script with the necessary schema and test data.
 */

// Load Composer's autoloader to load project dependencies.
require_once __DIR__ . '/../vendor/autoload.php';

// Configure environment variables for the test environment.
putenv('MYSQL_HOST=mysql');                     // MySQL host for tests.
putenv('MYSQL_USER=root');                      // MySQL user for tests.
putenv('MYSQL_PASSWORD=root_password');         // MySQL password for tests.
putenv('MYSQL_DB=chimera_test');                // Test database name.
putenv('JWT_SECRET=test_secret_key');           // JWT secret key used for testing.

/**
 * Initialize the test database.
 *
 * This function connects to the MySQL server using the environment variables,
 * creates the test database if it doesn't already exist, selects the test database,
 * and executes the SQL script located in the fixtures directory to create tables and insert test data.
 *
 * @return void
 */
function initTestDatabase()
{
    // Retrieve database connection parameters from environment variables.
    $host = getenv('MYSQL_HOST');
    $user = getenv('MYSQL_USER');
    $pass = getenv('MYSQL_PASSWORD');
    $db   = getenv('MYSQL_DB');

    try {
        // Connect to the MySQL server (without selecting a specific database).
        $pdo = new PDO("mysql:host=$host", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Create the test database if it doesn't exist.
        $pdo->exec("CREATE DATABASE IF NOT EXISTS $db");
        // Select the test database.
        $pdo->exec("USE $db");

        // Load the SQL initialization script from the fixtures directory.
        $sql = file_get_contents(__DIR__ . '/fixtures/init_test_db.sql');
        // Execute the SQL script to set up the database schema and test data.
        $pdo->exec($sql);

        // Output a success message to confirm database initialization.
        echo "Test database initialized successfully\n";
    } catch (PDOException $e) {
        // Output an error message and exit if the database initialization fails.
        echo "Test database initialization error: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// Initialize the test database.
initTestDatabase();
