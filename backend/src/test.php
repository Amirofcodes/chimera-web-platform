<?php
// Simple test endpoint to verify API is accessible
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

echo json_encode([
    'success' => true,
    'message' => 'API is working',
    'time' => date('Y-m-d H:i:s'),
    'request_uri' => $_SERVER['REQUEST_URI'],
    'server_name' => $_SERVER['SERVER_NAME'],
    'php_version' => phpversion()
]);