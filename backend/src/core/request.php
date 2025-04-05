<?php
/**
 * Request Parsing Functions
 *
 * This file provides helper functions to parse and normalize the incoming HTTP request.
 * It includes functions to:
 * - Retrieve and clean up the request path.
 * - Parse JSON data from the request body.
 */

/**
 * Get the normalized request path.
 *
 * This function:
 * 1. Extracts the path component from the request URI.
 * 2. Trims any leading or trailing slashes.
 * 3. Removes the "api/" prefix if present.
 * 4. Defaults to 'test' if the resulting path is empty.
 *
 * @return string The normalized request path.
 */
function getRequestPath()
{
    // Parse the URL to get the path component.
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remove leading and trailing slashes for consistency.
    $path = trim($path, '/');

    // Remove the "api/" prefix from the path if it exists.
    if (strpos($path, 'api/') === 0) {
        $path = substr($path, 4);
    }

    // If the path is empty, set a default value.
    if (empty($path)) {
        $path = 'test';
    }

    return $path;
}

/**
 * Get JSON data from the request body.
 *
 * This function:
 * 1. Reads the raw input from the PHP input stream.
 * 2. Attempts to decode the input as JSON into an associative array.
 * 3. Logs an error and returns null if JSON decoding fails.
 *
 * @return array|null Parsed JSON data as an associative array, or null on failure.
 */
function getJsonData()
{
    // Read the raw request body.
    $raw_input = file_get_contents('php://input');
    $data = null;

    // If there is input, attempt to decode it from JSON.
    if (!empty($raw_input)) {
        $data = json_decode($raw_input, true);
        // Check if JSON decoding produced an error.
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON Error: " . json_last_error_msg());
            return null;
        }
    }

    return $data;
}
