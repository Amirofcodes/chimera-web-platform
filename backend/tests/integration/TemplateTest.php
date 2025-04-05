<?php

namespace Tests\Integration;

class TemplateTest extends ApiTestCase
{
    private $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer un utilisateur et se connecter
        $email = 'template_test_' . time() . '@example.com';
        $password = 'Test@123456';

        $this->createUser($email, $password);
        $loginResponse = $this->login($email, $password);
        $this->token = $loginResponse['access_token'];
    }

    public function testListTemplates()
    {
        $response = $this->client->get('/templates');
        $responseBody = json_decode($response->getBody(), true);

        $this->assertTrue($responseBody['success']);
        $this->assertArrayHasKey('templates', $responseBody);
        $this->assertIsArray($responseBody['templates']);
    }

    public function testDownloadTemplate()
    {
        // Essayer de télécharger sans authentification
        $response = $this->client->get('/templates/download?id=php/nginx/mysql');
        $responseBody = json_decode($response->getBody(), true);

        $this->assertFalse($responseBody['success']);
        $this->assertEquals(401, $response->getStatusCode());

        // Télécharger avec authentification
        $response = $this->client->get('/templates/download?id=php/nginx/mysql', [
            'headers' => [
                'Authorization' => "Bearer $this->token"
            ]
        ]);

        $responseBody = json_decode($response->getBody(), true);
        $this->assertTrue($responseBody['success']);
        $this->assertArrayHasKey('download_url', $responseBody);
    }
}
