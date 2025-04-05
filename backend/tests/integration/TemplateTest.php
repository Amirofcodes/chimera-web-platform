<?php

namespace Tests\Integration;

use Tests\Integration\ApiTestCase;

/**
 * TemplateTest covers integration tests related to template endpoints.
 *
 * It tests listing available templates and downloading a template,
 * both with and without proper authentication.
 */
class TemplateTest extends ApiTestCase
{
    /**
     * @var string The JWT access token obtained after user login.
     */
    private $token;

    /**
     * setUp() is executed before each test method.
     *
     * This method creates a new test user and logs them in to retrieve a valid JWT token.
     * The token is stored in the $token property for use in authenticated requests.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create unique test user credentials for template-related tests.
        $email = 'template_test_' . time() . '@example.com';
        $password = 'Test@123456';

        // Register the new user.
        $this->createUser($email, $password);
        // Log in with the new user's credentials.
        $loginResponse = $this->login($email, $password);
        // Store the access token from the login response.
        $this->token = $loginResponse['access_token'];
    }

    /**
     * Test listing available templates.
     *
     * This test sends a GET request to the /templates endpoint and verifies that:
     * - The response indicates success.
     * - The response contains a 'templates' key.
     * - The 'templates' value is an array.
     */
    public function testListTemplates()
    {
        // Send GET request to list templates.
        $response = $this->client->get('/templates');
        // Decode the JSON response.
        $responseBody = json_decode($response->getBody(), true);

        // Assert that the API response indicates success.
        $this->assertTrue($responseBody['success']);
        // Assert that the response includes the templates array.
        $this->assertArrayHasKey('templates', $responseBody);
        // Assert that the templates key contains an array.
        $this->assertIsArray($responseBody['templates']);
    }

    /**
     * Test downloading a template.
     *
     * This test verifies two scenarios:
     * 1. Attempting to download a template without authentication should fail.
     * 2. Downloading a template with a valid access token should succeed.
     */
    public function testDownloadTemplate()
    {
        // Attempt to download a template without an Authorization token.
        $response = $this->client->get('/templates/download?id=php/nginx/mysql');
        $responseBody = json_decode($response->getBody(), true);

        // Assert that the API responds with an error (unauthorized).
        $this->assertFalse($responseBody['success']);
        $this->assertEquals(401, $response->getStatusCode());

        // Now, attempt to download the template with a valid token.
        $response = $this->client->get('/templates/download?id=php/nginx/mysql', [
            'headers' => [
                'Authorization' => "Bearer $this->token"
            ]
        ]);

        $responseBody = json_decode($response->getBody(), true);
        // Assert that the download request succeeds when authenticated.
        $this->assertTrue($responseBody['success']);
        // Assert that the response contains a download URL.
        $this->assertArrayHasKey('download_url', $responseBody);
    }
}
