<?php
/**
 * Database Connection Handler
 *
 * This file establishes a connection to the MySQL database using PDO.
 * It retrieves connection parameters from environment variables and sets up error handling.
 * In case of any issues, it logs an error and returns null.
 */

/**
 * Get a PDO database connection.
 *
 * This function:
 * 1. Retrieves database connection parameters from the environment variables.
 * 2. Checks that all required parameters are provided.
 * 3. Constructs the DSN (Data Source Name) for PDO.
 * 4. Attempts to create a new PDO connection.
 * 5. Sets the PDO error mode to exception for better error handling.
 * 6. Returns the PDO connection or null if connection fails.
 *
 * @return PDO|null Database connection instance or null on failure.
 */
function getDbConnection()
{
    // Retrieve MySQL connection details from environment variables.
    $host = getenv('MYSQL_HOST');
    $port = getenv('MYSQL_PORT'); // Port number, may be omitted in some environments.
    $db   = getenv('MYSQL_DB');
    $user = getenv('MYSQL_USER');
    $pass = getenv('MYSQL_PASSWORD');

    // Ensure all required environment variables are set.
    if (!$host || !$db || !$user || !$pass) {
        error_log("Missing database environment variables");
        return null;
    }

    try {
        // Construct the Data Source Name (DSN) for the PDO connection.
        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        // Create a new PDO instance with the DSN and credentials.
        $pdo = new PDO($dsn, $user, $pass);
        // Set the PDO error mode to exception to catch errors properly.
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        // Log any connection errors and return null.
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}
