<?php

/**
 * Main API router
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load core utilities
require_once 'core/database.php';
require_once 'core/jwt.php';
require_once 'core/response.php';
require_once 'core/request.php';

// Load controllers
require_once 'controllers/auth.php';
require_once 'controllers/templates.php';
require_once 'controllers/user.php';

// Add CORS headers for local development
$allowed_origin = getenv('ALLOWED_ORIGIN') ?: 'http://localhost:3000';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

header('Content-Type: application/json');

// Log the request URI for debugging
error_log("API Request: " . $_SERVER['REQUEST_URI']);

// Get normalized request path
$path = getRequestPath();
error_log("Normalized path: " . $path);

// Debug info
error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("CONTENT TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set'));

// Route the request
if ($path === 'test') {
    // Simple API test endpoint
    sendSuccessResponse(['message' => 'API is working']);
} else if ($path === 'dbtest') {
    // Database test endpoint
    $pdo = getDbConnection();
    if ($pdo) {
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
        sendSuccessResponse(['db_version' => $version]);
    } else {
        sendErrorResponse('Database connection failed', 500);
    }
} else if (strpos($path, 'auth/') === 0) {
    // Auth routes (login, register, profile, etc.)
    routeAuthRequest($path);
} else if (strpos($path, 'templates') === 0) {
    // Template routes
    routeTemplateRequest($path);
} else if ($path === 'dashboard' || strpos($path, 'user/') === 0) {
    // User/dashboard routes
    routeUserRequest($path);
} else {
    // Not found
    error_log("No route found for path: " . $path);
    sendErrorResponse('Endpoint not found', 404, ['path' => $path]);
}

error_log("========= API REQUEST END =========");
