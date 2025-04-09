<?php
/**
 * Templates Controller
 *
 * This controller handles template-related operations including:
 * - Listing available templates.
 * - Handling template download requests.
 *
 * It uses helper functions for database interactions, JWT authentication, and sending responses.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/template.php';

/**
 * Retrieve the list of templates.
 *
 * This function attempts to fetch all templates from the database.
 * If no templates are found (e.g., due to a database issue), it falls back to a set of static data.
 *
 * @return void Sends a success response with the templates list.
 */
function handleTemplatesList()
{
    // Fetch all templates from the database.
    $templates = getAllTemplates();

    // If the database call returns an empty result, use fallback static data.
    if (empty($templates)) {
        $templates = [
            [
                'id'          => 'php/nginx/mysql',
                'name'        => 'PHP/Nginx/MySQL Stack',
                'description' => 'PHP development environment with Nginx web server and MySQL database',
                'tags'        => ['php', 'mysql', 'nginx'],
                'downloads'   => 1250
            ],
            [
                'id'          => 'php/nginx/postgresql',
                'name'        => 'PHP/Nginx/PostgreSQL Stack',
                'description' => 'PHP development environment with Nginx web server and PostgreSQL database',
                'tags'        => ['php', 'postgresql', 'nginx'],
                'downloads'   => 820
            ],
            [
                'id'          => 'php/nginx/mariadb',
                'name'        => 'PHP/Nginx/MariaDB Stack',
                'description' => 'PHP development environment with Nginx web server and MariaDB database',
                'tags'        => ['php', 'mariadb', 'nginx'],
                'downloads'   => 960
            ],
            [
                'id'          => 'fullstack/react-php/mysql-nginx',
                'name'        => 'React/PHP/MySQL Fullstack Stack',
                'description' => 'Complete fullstack development environment with React, PHP backend, and MySQL database',
                'tags'        => ['react', 'php', 'mysql', 'fullstack'],
                'downloads'   => 1840
            ]
        ];
    }

    // Return the list of templates as a successful JSON response.
    sendSuccessResponse(['templates' => $templates]);
}

/**
 * Process a template download request.
 *
 * This function performs the following steps:
 * - Authenticates the user.
 * - Validates that a template ID is provided.
 * - Retrieves the download URL for the specified template.
 * - Records the download event in the database.
 * - Determines the file size for informational purposes.
 * - Returns a response with download details.
 *
 * @return void Sends a success response with template download information.
 */
function handleTemplateDownload()
{
    // Ensure the user is authenticated.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Verify that the template ID is provided as a query parameter.
    if (!isset($_GET['id'])) {
        sendErrorResponse('Template ID is required', 400);
    }

    $template_id = $_GET['id'];

    // Retrieve the download URL for the specified template.
    $download_url = getTemplateDownloadUrl($template_id);
    if (!$download_url) {
        sendErrorResponse('Template not found', 404);
    }

    // Record the template download event in the database.
    recordTemplateDownload($user['id'], $template_id);

    // Calculate the file size of the template file for informational purposes.
    $file_path = __DIR__ . '/..' . $download_url;
    $file_size = file_exists($file_path) ? filesize($file_path) : '1024 KB';

    // Return the download information as a success response.
    sendSuccessResponse([
        'template_id'  => $template_id,
        'message'      => 'Template download ready',
        'download_url' => $download_url,
        'size'         => $file_size
    ]);
}

/**
 * Route template-related requests to the appropriate handler.
 *
 * This function inspects the provided request path and routes it to:
 * - The templates list handler if the path is 'templates'.
 * - The template download handler if the path is 'templates/download'.
 * - An error response if the endpoint is not recognized.
 *
 * @param string $path The request path.
 * @return void Sends an appropriate JSON response based on the route.
 */
function routeTemplateRequest($path)
{
    if ($path === 'templates') {
        handleTemplatesList();
    } elseif ($path === 'templates/download') {
        handleTemplateDownload();
    } else {
        sendErrorResponse('Template endpoint not found', 404);
    }
}
