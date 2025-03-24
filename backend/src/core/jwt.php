<?php

/**
 * JWT handling functions.
 */

/**
 * Generate a simple JWT token.
 * @param array $payload Data to encode in the token
 * @return string The JWT token
 */
function generateJWT($payload)
{
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60 * 24); // 24-hour expiration
    $payload['iat'] = time();
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
}

/**
 * Verify a JWT token.
 * @param string $token The JWT token to verify
 * @return array The decoded payload or throws exception on failure
 */
function verifyJWT($token)
{
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
    $valid_signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
    if (!hash_equals($signature, $valid_signature)) {
        throw new Exception('Invalid token signature');
    }
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token has expired');
    }
    return $payload;
}

/**
 * Authenticate the request by verifying the JWT token in the Authorization header.
 * @return array|null User data from token or null if not authenticated
 */
function authenticateRequest()
{
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        return null;
    }
    $authHeader = $headers['Authorization'];
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    $token = substr($authHeader, 7);
    try {
        return verifyJWT($token);
    } catch (Exception $e) {
        error_log("Authentication error: " . $e->getMessage());
        return null;
    }
}
