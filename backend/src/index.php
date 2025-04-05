<?php
/**
 * Main API Router
 *
 * This file serves as the entry point for all API requests.
 * It configures error reporting, loads required utilities and controllers,
 * sets necessary headers (including CORS), and routes requests to appropriate handlers.
 */

// Enable detailed error reporting for debugging during development.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load core utility functions for database access, JWT authentication, responses, and request parsing.
require_once 'core/database.php';
require_once 'core/jwt.php';
require_once 'core/response.php';
require_once 'core/request.php';

// Load all controller files to handle specific routes.
require_once 'controllers/auth.php';
require_once 'controllers/templates.php';
require_once 'controllers/user.php';
require_once 'controllers/payment.php';

// Set CORS headers to allow requests from the allowed origin (useful during local development).
$allowed_origin = getenv('ALLOWED_ORIGIN') ?: 'http://localhost:3000';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests by returning a 204 No Content response.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Set the content type header to ensure the API returns JSON.
header('Content-Type: application/json');

// Log the incoming request URI for debugging purposes.
error_log("API Request: " . $_SERVER['REQUEST_URI']);

// Retrieve and normalize the request path using the helper function.
$path = getRequestPath();
error_log("Normalized path: " . $path);

// Log additional debug information such as request method and content type.
error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("CONTENT TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set'));

// Route the request based on the normalized path.
if ($path === 'test') {
    // Test endpoint to verify the API is working.
    sendSuccessResponse(['message' => 'API is working']);
} else if ($path === 'dbtest') {
    // Database test endpoint: verifies the connection and returns the database version.
    $pdo = getDbConnection();
    if ($pdo) {
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
        sendSuccessResponse(['db_version' => $version]);
    } else {
        sendErrorResponse('Database connection failed', 500);
    }
} else if (strpos($path, 'auth/') === 0) {
    // Route authentication-related requests (e.g., login, register, profile, password reset).
    routeAuthRequest($path);
} else if (strpos($path, 'templates') === 0) {
    // Route template-related requests (e.g., list templates, download template).
    routeTemplateRequest($path);
} else if ($path === 'dashboard' || strpos($path, 'user/') === 0) {
    // Route requests for user-specific operations (e.g., dashboard, download history).
    routeUserRequest($path);
} else if (strpos($path, 'payment/') === 0) {
    // Route payment-related requests (e.g., create payment, verify payment).
    routePaymentRequest($path);
} else {
    // If no matching route is found, log the error and return a 404 Not Found response.
    error_log("No route found for path: " . $path);
    sendErrorResponse('Endpoint not found', 404, ['path' => $path]);
}

// Log the end of the API request processing.
error_log("========= API REQUEST END =========");
