<?php
/**
 * User Controller
 *
 * This controller manages user-related actions such as:
 * - Retrieving the download history for a user.
 * - Providing access to the user dashboard.
 *
 * It includes the necessary dependencies for database operations, JWT authentication,
 * response formatting, and user data retrieval.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/user.php';

/**
 * Retrieve the authenticated user's download history.
 *
 * Steps:
 * 1. Authenticate the user using JWT.
 * 2. If authentication fails, send a 401 error response.
 * 3. Retrieve the user's download history from the database.
 * 4. Return the download history in a success response.
 *
 * @return void JSON response containing the downloads.
 */
function handleUserDownloads()
{
    // Authenticate the request using JWT token.
    $user = authenticateRequest();

    // If user is not authenticated, send an error response.
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Retrieve the download history for the authenticated user.
    $downloads = getUserDownloadHistory($user['id']);

    // Send the download history as a JSON success response.
    sendSuccessResponse(['downloads' => $downloads]);
}

/**
 * Provide access to the user dashboard.
 *
 * Steps:
 * 1. Authenticate the user.
 * 2. If authentication fails, send a 401 error response.
 * 3. Log the dashboard access for auditing purposes.
 * 4. Return a welcome message along with user data in the response.
 *
 * @return void JSON response containing dashboard information.
 */
function handleDashboard()
{
    // Authenticate the user.
    $user = authenticateRequest();

    // If authentication fails, send an error response.
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Log dashboard access for debugging or audit purposes.
    error_log("Dashboard accessed by user: " . $user['id']);

    // Return a success response with a welcome message and the user data.
    sendSuccessResponse([
        'dashboard' => [
            'message' => 'Welcome to your dashboard',
            'user'    => $user,
        ]
    ]);
}

/**
 * Route user-related requests to their respective handlers based on the request path.
 *
 * Supported paths:
 * - "user/downloads" : Returns the user's download history.
 * - "dashboard"      : Returns the user dashboard.
 *
 * If the path does not match any known endpoint, a 404 error response is returned.
 *
 * @param string $path The request path.
 * @return void JSON response from the corresponding handler.
 */
function routeUserRequest($path)
{
    switch ($path) {
        case 'user/downloads':
            handleUserDownloads();
            break;

        case 'dashboard':
            handleDashboard();
            break;

        default:
            sendErrorResponse('User endpoint not found', 404);
    }
}
