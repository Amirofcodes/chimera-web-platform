<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class JWTTest extends TestCase
{
    /**
     * setUp is called before each test.
     * Here we include the JWT helper functions so they are available to all test methods.
     */
    protected function setUp(): void
    {
        // Include the JWT functions from the core folder.
        require_once __DIR__ . '/../../src/core/jwt.php';
    }

    /**
     * Test that a JWT token can be generated and verified successfully.
     *
     * This test:
     * - Creates a payload with user id and email.
     * - Generates a JWT token using the generateJWT function.
     * - Verifies that the token is a non-empty string.
     * - Decodes the token using verifyJWT.
     * - Asserts that the decoded payload contains the same user id and email.
     * - Checks that the token includes the 'exp' (expiration) and 'iat' (issued at) timestamps.
     */
    public function testGenerateAndVerifyJWT()
    {
        $payload = ['id' => 1, 'email' => 'test@example.com'];

        // Generate a JWT token from the payload.
        $token = generateJWT($payload);

        // Assert that the token is a non-empty string.
        $this->assertIsString($token);
        $this->assertNotEmpty($token);

        // Verify the token to decode the payload.
        $decodedPayload = verifyJWT($token);

        // Assert that the decoded payload matches the original payload values.
        $this->assertEquals($payload['id'], $decodedPayload['id']);
        $this->assertEquals($payload['email'], $decodedPayload['email']);

        // Assert that the token contains the 'exp' (expiration) and 'iat' (issued at) fields.
        $this->assertArrayHasKey('exp', $decodedPayload);
        $this->assertArrayHasKey('iat', $decodedPayload);
    }

    /**
     * Test that an expired token triggers an exception.
     *
     * This test manually creates a token with an expiration time in the past.
     * It then calls verifyJWT and expects an exception with the message "Token has expired".
     */
    public function testExpiredToken()
    {
        // Create a payload with an expiration time set to one hour in the past.
        $payload = ['id' => 1, 'email' => 'test@example.com', 'exp' => time() - 3600];
        $secret = getenv('JWT_SECRET') ?: 'your-secret-key';

        // Build the JWT header as a JSON string.
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        // Encode the header and payload using Base64URL encoding.
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
        // Generate the signature using HMAC with SHA256.
        $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        // Concatenate the encoded parts to form the JWT token.
        $token = "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";

        // Expect an exception to be thrown due to the token being expired.
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Token has expired');

        // Attempt to verify the expired token, which should trigger the exception.
        verifyJWT($token);
    }
}
