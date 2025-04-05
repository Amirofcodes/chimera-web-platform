<?php
/**
 * Test API Endpoint
 *
 * This script is used to verify that the PHP environment is working correctly.
 * It outputs information about the PHP version, server environment, and tests
 * the database connection using environment variables.
 */

// Set the Content-Type header to indicate JSON output.
header('Content-Type: application/json');

// Build an initial response array with various environment and server details.
$response = [
    'status'          => 'success',
    'message'         => 'PHP processing is working correctly',
    'php_version'     => phpversion(),                         // Current PHP version.
    'request_uri'     => $_SERVER['REQUEST_URI'],              // The requested URI.
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown', // Web server software.
    'date'            => date('Y-m-d H:i:s'),                  // Current server date and time.
    'environment'     => [
        // Retrieve database host and name from environment variables or default to 'Not set'.
        'MYSQL_HOST'      => getenv('MYSQL_HOST') ?: 'Not set',
        'MYSQL_DB'        => getenv('MYSQL_DB') ?: 'Not set',
        // Indicate whether the JWT secret is set (do not expose its value).
        'JWT_SECRET'      => getenv('JWT_SECRET') ? 'Set' : 'Not set',
        'PHP_ENVIRONMENT' => getenv('PHP_ENVIRONMENT') ?: 'Not set'
    ]
];

// Test database connection.
try {
    // Check if all required database environment variables are set.
    if (getenv('MYSQL_HOST') && getenv('MYSQL_DB') && getenv('MYSQL_USER') && getenv('MYSQL_PASSWORD')) {
        // Build the Data Source Name (DSN) for connecting to the MySQL database.
        $dsn = "mysql:host=" . getenv('MYSQL_HOST') . ";port=" . (getenv('MYSQL_PORT') ?: '3306') . ";dbname=" . getenv('MYSQL_DB');
        // Create a new PDO instance using the DSN and credentials.
        $pdo = new PDO($dsn, getenv('MYSQL_USER'), getenv('MYSQL_PASSWORD'));
        // Set PDO error mode to exception for better error handling.
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Execute a simple query to retrieve the MySQL version.
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
        
        // Add database connection details to the response array.
        $response['database'] = [
            'status'  => 'connected',
            'version' => $version
        ];
    } else {
        // If required environment variables are missing, note that the database is not configured.
        $response['database'] = [
            'status'  => 'not_configured',
            'message' => 'Database environment variables are not set'
        ];
    }
} catch (PDOException $e) {
    // In case of a PDO exception, capture and report the error in the response.
    $response['database'] = [
        'status'  => 'error',
        'message' => $e->getMessage()
    ];
}

// Output the final response as a pretty-printed JSON string.
echo json_encode($response, JSON_PRETTY_PRINT);
