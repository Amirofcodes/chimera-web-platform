<?php

/**
 * Request parsing functions.
 */

/**
 * Get the normalized request path.
 * @return string The normalized path
 */
function getRequestPath()
{
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = trim($path, '/');

    // Remove the "api/" prefix if present
    if (strpos($path, 'api/') === 0) {
        $path = substr($path, 4);
    }

    // Default to 'test' if the path is empty
    if (empty($path)) {
        $path = 'test';
    }

    return $path;
}

/**
 * Get JSON data from the request body.
 * @return array|null Parsed JSON data or null on failure
 */
function getJsonData()
{
    $raw_input = file_get_contents('php://input');
    $data = null;

    if (!empty($raw_input)) {
        $data = json_decode($raw_input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON Error: " . json_last_error_msg());
            return null;
        }
    }

    return $data;
}
