<?php

namespace Tests\Integration;

class AuthTest extends ApiTestCase
{
    private $testEmail;
    private $testPassword;

    protected function setUp(): void
    {
        parent::setUp();

        $this->testEmail = 'test_' . time() . '@example.com';
        $this->testPassword = 'Test@123456';
    }

    public function testRegisterAndLogin()
    {
        // Test d'inscription
        $registerResponse = $this->createUser($this->testEmail, $this->testPassword, 'Test User');

        $this->assertTrue($registerResponse['success']);
        $this->assertArrayHasKey('user', $registerResponse);
        $this->assertArrayHasKey('access_token', $registerResponse);
        $this->assertEquals($this->testEmail, $registerResponse['user']['email']);

        // Test de connexion
        $loginResponse = $this->login($this->testEmail, $this->testPassword);

        $this->assertTrue($loginResponse['success']);
        $this->assertArrayHasKey('user', $loginResponse);
        $this->assertArrayHasKey('access_token', $loginResponse);
        $this->assertEquals($this->testEmail, $loginResponse['user']['email']);
    }

    public function testInvalidLogin()
    {
        $response = $this->login('invalid@example.com', 'wrongpassword');

        $this->assertFalse($response['success']);
        $this->assertArrayHasKey('error', $response);
    }

    public function testProtectedEndpoint()
    {
        // Essayer d'accéder sans token
        $response = $this->client->get('/dashboard');
        $responseBody = json_decode($response->getBody(), true);

        $this->assertFalse($responseBody['success']);
        $this->assertEquals(401, $response->getStatusCode());

        // S'authentifier d'abord en créant un utilisateur
        $email = 'protected_test_' . time() . '@example.com';
        $password = 'Test@123456';

        $this->createUser($email, $password);
        $loginResponse = $this->login($email, $password);

        // Vérifier que la connexion a réussi et que le token est présent
        $this->assertTrue($loginResponse['success']);
        $this->assertArrayHasKey('access_token', $loginResponse);

        $token = $loginResponse['access_token'];

        // Accéder avec token
        $response = $this->client->get('/dashboard', [
            'headers' => [
                'Authorization' => "Bearer $token"
            ]
        ]);

        $responseBody = json_decode($response->getBody(), true);
        $this->assertTrue($responseBody['success']);
    }
}
