<?php

/**
 * Templates controller.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/template.php';

/**
 * Handle templates list route.
 */
function handleTemplatesList()
{
    $templates = getAllTemplates();

    // Fall back to static data if database fails
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

    sendSuccessResponse(['templates' => $templates]);
}

/**
 * Handle template download route.
 */
function handleTemplateDownload()
{
    $user = authenticateRequest();

    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    if (!isset($_GET['id'])) {
        sendErrorResponse('Template ID is required', 400);
    }

    $template_id = $_GET['id'];
    $download_url = getTemplateDownloadUrl($template_id);

    if (!$download_url) {
        sendErrorResponse('Template not found', 404);
    }

    // Record the download
    recordTemplateDownload($user['id'], $template_id);

    $file_path = __DIR__ . '/..' . $download_url;
    $file_size = file_exists($file_path) ? filesize($file_path) : '1024 KB';

    sendSuccessResponse([
        'template_id'  => $template_id,
        'message'      => 'Template download ready',
        'download_url' => $download_url,
        'size'         => $file_size
    ]);
}

/**
 * Route template requests to appropriate handlers.
 * @param string $path Request path
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
