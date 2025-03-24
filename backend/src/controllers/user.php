<?php

/**
 * User controller.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/user.php';

/**
 * Handle user downloads history.
 */
function handleUserDownloads()
{
    $user = authenticateRequest();

    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    $downloads = getUserDownloadHistory($user['id']);

    sendSuccessResponse(['downloads' => $downloads]);
}

/**
 * Handle dashboard route.
 */
function handleDashboard()
{
    $user = authenticateRequest();

    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    error_log("Dashboard accessed by user: " . $user['id']);

    sendSuccessResponse([
        'dashboard' => [
            'message' => 'Welcome to your dashboard',
            'user'    => $user,
        ]
    ]);
}

/**
 * Route user requests to appropriate handlers.
 * @param string $path Request path
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
