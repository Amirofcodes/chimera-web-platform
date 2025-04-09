<?php
/**
 * API Response Handling Functions
 *
 * These functions standardize JSON responses for API endpoints.
 * They allow sending both success and error responses with proper HTTP status codes and headers.
 */

/**
 * Send a JSON response with the specified HTTP status code.
 *
 * This function sets the HTTP response code and Content-Type header,
 * then encodes the provided data into JSON and outputs it.
 *
 * @param array $data Response data to be sent.
 * @param int   $statusCode HTTP status code (default is 200 OK).
 */
function sendJsonResponse($data, $statusCode = 200)
{
    // Set the HTTP status code for the response.
    http_response_code($statusCode);
    
    // Set the content type to application/json.
    header('Content-Type: application/json');
    
    // Encode the data array to JSON and output it.
    echo json_encode($data);
    
    // Terminate the script to ensure no further output is sent.
    exit();
}

/**
 * Send a success response.
 *
 * This function wraps the provided data in a standard success format,
 * adding a 'success' key set to true.
 *
 * @param array $data Response data to be sent.
 * @param int   $statusCode HTTP status code (default is 200 OK).
 */
function sendSuccessResponse($data = [], $statusCode = 200)
{
    // Merge the provided data with a success flag.
    $response = array_merge(['success' => true], $data);
    
    // Send the JSON response with the specified status code.
    sendJsonResponse($response, $statusCode);
}

/**
 * Send an error response.
 *
 * This function constructs an error response with a standardized format,
 * including a 'success' flag set to false and an 'error' message.
 * Additional data can be provided if needed.
 *
 * @param string $message The error message to send.
 * @param int    $statusCode HTTP status code (default is 400 Bad Request).
 * @param array  $additionalData Optional additional data to include in the response.
 */
function sendErrorResponse($message, $statusCode = 400, $additionalData = [])
{
    // Merge the error message with a success flag and any additional data.
    $response = array_merge(['success' => false, 'error' => $message], $additionalData);
    
    // Send the JSON response with the specified status code.
    sendJsonResponse($response, $statusCode);
}
