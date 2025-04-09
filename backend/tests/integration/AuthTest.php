<?php

namespace Tests\Integration;

use Tests\Integration\ApiTestCase;

/**
 * AuthTest covers integration tests related to authentication.
 *
 * It tests user registration, login (both successful and failed),
 * and access to protected endpoints.
 */
class AuthTest extends ApiTestCase
{
    /**
     * @var string Test email used for registration and login.
     */
    private $testEmail;
    
    /**
     * @var string Test password used for registration and login.
     */
    private $testPassword;

    /**
     * setUp() is executed before each test.
     *
     * This method calls the parent setUp to initialize the API client,
     * and then generates unique test credentials.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Generate a unique test email using the current timestamp.
        $this->testEmail = 'test_' . time() . '@example.com';
        // Set a default test password.
        $this->testPassword = 'Test@123456';
    }

    /**
     * Test the complete registration and login process.
     *
     * This test:
     * - Registers a new user.
     * - Asserts that registration is successful and returns the expected fields.
     * - Logs in with the registered credentials.
     * - Asserts that login is successful and returns the expected user data.
     */
    public function testRegisterAndLogin()
    {
        // Test user registration.
        $registerResponse = $this->createUser($this->testEmail, $this->testPassword, 'Test User');

        // Verify that registration was successful.
        $this->assertTrue($registerResponse['success'], "Registration should be successful");
        $this->assertArrayHasKey('user', $registerResponse, "Response should contain a 'user' key");
        $this->assertArrayHasKey('access_token', $registerResponse, "Response should contain an 'access_token'");
        $this->assertEquals($this->testEmail, $registerResponse['user']['email'], "Registered email should match");

        // Test user login with the same credentials.
        $loginResponse = $this->login($this->testEmail, $this->testPassword);

        // Verify that login was successful.
        $this->assertTrue($loginResponse['success'], "Login should be successful");
        $this->assertArrayHasKey('user', $loginResponse, "Response should contain a 'user' key");
        $this->assertArrayHasKey('access_token', $loginResponse, "Response should contain an 'access_token'");
        $this->assertEquals($this->testEmail, $loginResponse['user']['email'], "Logged-in email should match");
    }

    /**
     * Test login with invalid credentials.
     *
     * This test attempts to log in with an invalid email and password,
     * expecting the API to return an error.
     */
    public function testInvalidLogin()
    {
        // Attempt to login with invalid credentials.
        $response = $this->login('invalid@example.com', 'wrongpassword');

        // Verify that login failed and an error message is returned.
        $this->assertFalse($response['success'], "Login should fail for invalid credentials");
        $this->assertArrayHasKey('error', $response, "Response should contain an 'error' message");
    }

    /**
     * Test access to a protected endpoint.
     *
     * This test:
     * - Attempts to access the dashboard without an access token (expecting failure).
     * - Creates a new user and logs in to retrieve a valid token.
     * - Accesses the dashboard with the valid token (expecting success).
     */
    public function testProtectedEndpoint()
    {
        // Try to access the protected /dashboard endpoint without a token.
        $response = $this->client->get('/dashboard');
        $responseBody = json_decode($response->getBody(), true);

        // Assert that access is denied when not authenticated.
        $this->assertFalse($responseBody['success'], "Access without token should fail");
        $this->assertEquals(401, $response->getStatusCode(), "Expected HTTP status code 401");

        // Create a new user for testing protected endpoint access.
        $email = 'protected_test_' . time() . '@example.com';
        $password = 'Test@123456';

        // Register the new user.
        $this->createUser($email, $password);
        // Log in the new user to retrieve a valid access token.
        $loginResponse = $this->login($email, $password);

        // Assert that the login is successful and the token is present.
        $this->assertTrue($loginResponse['success'], "Login should be successful for protected endpoint test");
        $this->assertArrayHasKey('access_token', $loginResponse, "Login response should include an access token");

        $token = $loginResponse['access_token'];

        // Access the protected /dashboard endpoint using the valid token.
        $response = $this->client->get('/dashboard', [
            'headers' => [
                'Authorization' => "Bearer $token"
            ]
        ]);

        $responseBody = json_decode($response->getBody(), true);
        // Assert that the endpoint is accessible when authenticated.
        $this->assertTrue($responseBody['success'], "Access with valid token should succeed");
    }
}
