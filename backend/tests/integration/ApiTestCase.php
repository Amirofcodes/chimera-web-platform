<?php

namespace Tests\Integration;

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;

/**
 * ApiTestCase serves as a base class for integration tests
 * that interact with the API. It provides common setup
 * and helper methods for sending HTTP requests.
 */
class ApiTestCase extends TestCase
{
    /**
     * @var Client Guzzle HTTP client for sending API requests.
     */
    protected $client;

    /**
     * @var string Base URL of the API.
     */
    protected $apiUrl;

    /**
     * Set up the test case environment.
     *
     * This method initializes the API URL from environment variables
     * (defaulting to 'http://localhost:8000') and creates a Guzzle client
     * configured with the API base URI and settings to avoid throwing exceptions
     * on HTTP errors.
     */
    protected function setUp(): void
    {
        // Retrieve API URL from environment variables or default to localhost.
        $this->apiUrl = getenv('API_URL') ?: 'http://localhost:8000';
        
        // Initialize the Guzzle HTTP client with the base URI.
        $this->client = new Client([
            'base_uri' => $this->apiUrl,
            // Disable exceptions on HTTP error responses.
            'http_errors' => false,
        ]);
    }

    /**
     * Helper method to create a new user via the API.
     *
     * This method sends a POST request to the /auth/register endpoint
     * with the provided email, password, and optional name.
     *
     * @param string      $email    Email address for the new user.
     * @param string      $password Plain text password.
     * @param string|null $name     Optional name of the user.
     * @return array Decoded JSON response from the API.
     */
    protected function createUser($email, $password, $name = null)
    {
        // Send a POST request to the registration endpoint.
        $response = $this->client->post('/auth/register', [
            'json' => [
                'email'    => $email,
                'password' => $password,
                'name'     => $name,
            ]
        ]);

        // Decode and return the JSON response as an associative array.
        return json_decode($response->getBody(), true);
    }

    /**
     * Helper method to log in a user via the API.
     *
     * This method sends a POST request to the /auth/login endpoint with the
     * provided email and password, returning the decoded JSON response.
     *
     * @param string $email    Email address of the user.
     * @param string $password Plain text password.
     * @return array Decoded JSON response from the API.
     */
    protected function login($email, $password)
    {
        // Send a POST request to the login endpoint.
        $response = $this->client->post('/auth/login', [
            'json' => [
                'email'    => $email,
                'password' => $password,
            ]
        ]);

        // Decode and return the JSON response as an associative array.
        return json_decode($response->getBody(), true);
    }
}
