<?php

namespace Tests\Integration;

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;

class ApiTestCase extends TestCase
{
    protected $client;
    protected $apiUrl;

    protected function setUp(): void
    {
        $this->apiUrl = getenv('API_URL') ?: 'http://localhost:8000';
        $this->client = new Client([
            'base_uri' => $this->apiUrl,
            'http_errors' => false,
        ]);
    }

    protected function createUser($email, $password, $name = null)
    {
        $response = $this->client->post('/auth/register', [
            'json' => [
                'email' => $email,
                'password' => $password,
                'name' => $name
            ]
        ]);

        return json_decode($response->getBody(), true);
    }

    protected function login($email, $password)
    {
        $response = $this->client->post('/auth/login', [
            'json' => [
                'email' => $email,
                'password' => $password
            ]
        ]);

        return json_decode($response->getBody(), true);
    }
}
