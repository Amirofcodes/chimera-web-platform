<?php

/**
 * API response handling functions.
 */

/**
 * Send a JSON response with appropriate headers.
 * @param array $data Response data
 * @param int $statusCode HTTP status code
 */
function sendJsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

/**
 * Send a success response.
 * @param array $data Response data
 * @param int $statusCode HTTP status code
 */
function sendSuccessResponse($data = [], $statusCode = 200)
{
    $response = array_merge(['success' => true], $data);
    sendJsonResponse($response, $statusCode);
}

/**
 * Send an error response.
 * @param string $message Error message
 * @param int $statusCode HTTP status code
 * @param array $additionalData Additional data to include
 */
function sendErrorResponse($message, $statusCode = 400, $additionalData = [])
{
    $response = array_merge(['success' => false, 'error' => $message], $additionalData);
    sendJsonResponse($response, $statusCode);
}
