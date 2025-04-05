<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class JWTTest extends TestCase
{
    private $jwtService;

    protected function setUp(): void
    {
        // Chemin relatif vers le fichier
        require_once __DIR__ . '/../../src/core/jwt.php';
    }

    public function testGenerateAndVerifyJWT()
    {
        $payload = ['id' => 1, 'email' => 'test@example.com'];

        // Générer un token
        $token = generateJWT($payload);

        // Vérifier que c'est une chaîne non vide
        $this->assertIsString($token);
        $this->assertNotEmpty($token);

        // Vérifier le token
        $decodedPayload = verifyJWT($token);

        // Vérifier que l'id et l'email sont corrects
        $this->assertEquals($payload['id'], $decodedPayload['id']);
        $this->assertEquals($payload['email'], $decodedPayload['email']);

        // Vérifier que les timestamps sont ajoutés
        $this->assertArrayHasKey('exp', $decodedPayload);
        $this->assertArrayHasKey('iat', $decodedPayload);
    }

    public function testExpiredToken()
    {
        // Créer un token expiré manuellement
        $payload = ['id' => 1, 'email' => 'test@example.com', 'exp' => time() - 3600];
        $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
        $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        $token = "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";

        // S'attendre à une exception pour token expiré
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Token has expired');

        verifyJWT($token);
    }
}
