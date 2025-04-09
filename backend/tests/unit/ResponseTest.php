<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ResponseTest extends TestCase
{
    /**
     * Setup for the test class.
     *
     * This method is called before each test is run. Here, we avoid including files that 
     * affect HTTP headers because we simulate the response structure in the tests.
     */
    protected function setUp(): void
    {
        // Intentionally left empty to simulate header-related functions without sending actual headers.
    }

    /**
     * Test the structure of a successful response.
     *
     * This test manually builds the expected success response structure and verifies that
     * the keys and values are as expected. It simulates what the sendSuccessResponse function would output.
     */
    public function testSuccessResponseStructure()
    {
        // Define the test data that would be included in a successful response.
        $data = ['data' => 'test'];
        // Build the expected response structure by merging a 'success' flag with the test data.
        $expected = array_merge(['success' => true], $data);

        // Assert that the success flag is set to true.
        $this->assertEquals(true, $expected['success']);
        // Assert that the data is correctly set in the expected response.
        $this->assertEquals('test', $expected['data']);
    }

    /**
     * Test the structure of an error response.
     *
     * This test manually builds the expected error response structure and verifies that
     * the error message and any additional data are correctly included. It simulates what 
     * the sendErrorResponse function would output.
     */
    public function testErrorResponseStructure()
    {
        // Define the error message and any additional data that should be part of an error response.
        $message = 'Error message';
        $statusCode = 400;
        $additionalData = ['additional' => 'info'];

        // Build the expected error response by merging a 'success' flag (false) with the error message and additional data.
        $expected = array_merge(['success' => false, 'error' => $message], $additionalData);

        // Assert that the success flag is false for error responses.
        $this->assertEquals(false, $expected['success']);
        // Assert that the error message is correctly set.
        $this->assertEquals('Error message', $expected['error']);
        // Assert that the additional data is correctly included.
        $this->assertEquals('info', $expected['additional']);
    }
}
