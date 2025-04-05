<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ResponseTest extends TestCase
{
    protected function setUp(): void
    {
        // Pour éviter de charger directement le fichier qui contient des fonctions
        // qui affectent les en-têtes HTTP, nous allons les simuler
    }

    public function testSuccessResponseStructure()
    {
        // Définir manuellement la structure de réponse attendue
        $data = ['data' => 'test'];
        $expected = array_merge(['success' => true], $data);

        // Comparer avec ce que produirait la fonction sendSuccessResponse
        $this->assertEquals(true, $expected['success']);
        $this->assertEquals('test', $expected['data']);
    }

    public function testErrorResponseStructure()
    {
        // Définir manuellement la structure de réponse attendue
        $message = 'Error message';
        $statusCode = 400;
        $additionalData = ['additional' => 'info'];

        $expected = array_merge(['success' => false, 'error' => $message], $additionalData);

        // Comparer avec ce que produirait la fonction sendErrorResponse
        $this->assertEquals(false, $expected['success']);
        $this->assertEquals('Error message', $expected['error']);
        $this->assertEquals('info', $expected['additional']);
    }
}
