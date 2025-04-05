<?php
/**
 * JWT Handling Functions
 *
 * This file contains helper functions to generate, verify, and authenticate JWT tokens.
 * JWT (JSON Web Token) is used here for stateless authentication.
 */

/**
 * Generate a JWT token.
 *
 * This function creates a JWT token with the following steps:
 * 1. Retrieves the secret key from environment variables (or uses a default).
 * 2. Creates a header specifying the token type and algorithm.
 * 3. Adds expiration (24 hours) and issued-at times to the payload.
 * 4. Base64URL encodes the header and payload.
 * 5. Generates a signature using HMAC with SHA-256.
 * 6. Concatenates the encoded header, payload, and signature to form the JWT token.
 *
 * @param array $payload Data to encode in the token.
 * @return string The generated JWT token.
 */
function generateJWT($payload)
{
    // Retrieve the secret key from environment variables or fallback to a default key.
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    
    // Create the token header with type and algorithm.
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Add expiration (24 hours from now) and issued-at timestamps to the payload.
    $payload['exp'] = time() + (60 * 60 * 24);
    $payload['iat'] = time();
    
    // Encode the header and payload using Base64URL encoding.
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    
    // Create the signature by hashing the header and payload with the secret key.
    $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Concatenate all parts to form the complete JWT token.
    return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
}

/**
 * Verify a JWT token.
 *
 * This function validates a JWT token by:
 * 1. Splitting the token into header, payload, and signature parts.
 * 2. Recomputing the signature and comparing it to the provided signature.
 * 3. Decoding the payload and checking the expiration time.
 *
 * @param string $token The JWT token to verify.
 * @return array The decoded payload if the token is valid.
 * @throws Exception if the token format is invalid, signature is incorrect, or the token has expired.
 */
function verifyJWT($token)
{
    // Retrieve the secret key from environment variables or use the default.
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    
    // Split the token into its three parts.
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    
    // Decode the signature from Base64URL.
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
    
    // Recompute the valid signature using the header and payload.
    $valid_signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
    
    // Compare the provided signature with the valid signature in a timing-safe manner.
    if (!hash_equals($signature, $valid_signature)) {
        throw new Exception('Invalid token signature');
    }
    
    // Decode the payload from Base64URL and convert JSON to an associative array.
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    
    // Check if the token has expired.
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token has expired');
    }
    
    return $payload;
}

/**
 * Authenticate the request using the JWT token from the Authorization header.
 *
 * This function:
 * 1. Retrieves all request headers.
 * 2. Checks for the presence of the "Authorization" header.
 * 3. Validates that the header starts with "Bearer ".
 * 4. Extracts and verifies the JWT token.
 * 5. Returns the decoded token payload (user data) if valid.
 *
 * @return array|null The user data from the token or null if authentication fails.
 */
function authenticateRequest()
{
    // Retrieve all HTTP request headers.
    $headers = getallheaders();
    
    // Check if the "Authorization" header exists.
    if (!isset($headers['Authorization'])) {
        return null;
    }
    
    $authHeader = $headers['Authorization'];
    
    // Ensure the header is in the expected "Bearer <token>" format.
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    // Extract the token from the header.
    $token = substr($authHeader, 7);
    
    // Attempt to verify the token. If verification fails, log the error and return null.
    try {
        return verifyJWT($token);
    } catch (Exception $e) {
        error_log("Authentication error: " . $e->getMessage());
        return null;
    }
}
