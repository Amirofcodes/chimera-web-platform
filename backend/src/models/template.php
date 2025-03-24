<?php

/**
 * Template model functions.
 */
require_once __DIR__ . '/../core/database.php';

/**
 * Get all templates.
 * @return array List of templates
 */
function getAllTemplates()
{
    $pdo = getDbConnection();
    if (!$pdo) {
        return []; // Return empty array on database error
    }

    try {
        $stmt = $pdo->query("SELECT id, name, description, category FROM templates");
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Enhance templates with additional data
        foreach ($templates as &$template) {
            $tags = [];
            if (strpos($template['description'], 'PHP') !== false) {
                $tags[] = 'php';
            }
            if (strpos($template['description'], 'MySQL') !== false) {
                $tags[] = 'mysql';
            }
            if (strpos($template['description'], 'PostgreSQL') !== false) {
                $tags[] = 'postgresql';
            }
            if (strpos($template['description'], 'MariaDB') !== false) {
                $tags[] = 'mariadb';
            }
            if (strpos($template['description'], 'Nginx') !== false) {
                $tags[] = 'nginx';
            }
            if (strpos($template['description'], 'React') !== false) {
                $tags[] = 'react';
            }
            if (strpos($template['description'], 'Fullstack') !== false) {
                $tags[] = 'fullstack';
            }
            $template['tags'] = $tags;

            // Get download count
            $stmtCount = $pdo->prepare("SELECT COUNT(*) as downloads FROM template_downloads WHERE template_id = ?");
            $stmtCount->execute([$template['id']]);
            $template['downloads'] = (int)$stmtCount->fetch(PDO::FETCH_ASSOC)['downloads'];
        }

        return $templates;
    } catch (PDOException $e) {
        error_log("Error fetching templates: " . $e->getMessage());
        return [];
    }
}

/**
 * Get template by ID.
 * @param string $templateId Template ID
 * @return array|null Template data or null if not found
 */
function getTemplateById($templateId)
{
    $templates = getAllTemplates();
    foreach ($templates as $template) {
        if ($template['id'] === $templateId) {
            return $template;
        }
    }
    return null;
}

/**
 * Record template download.
 * @param int $userId User ID
 * @param string $templateId Template ID
 * @return bool Success status
 */
function recordTemplateDownload($userId, $templateId)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    $stmt = $pdo->prepare("INSERT INTO template_downloads (user_id, template_id, download_date) VALUES (?, ?, NOW())");

    try {
        $stmt->execute([$userId, $templateId]);
        return true;
    } catch (PDOException $e) {
        error_log("Error recording download: " . $e->getMessage());
        return false;
    }
}

/**
 * Get template download URL.
 * @param string $templateId Template ID
 * @return string|null Download URL or null if template not found
 */
function getTemplateDownloadUrl($templateId)
{
    $templates = [
        'php/nginx/mysql'                => '/downloads/php-nginx-mysql.zip',
        'php/nginx/postgresql'           => '/downloads/php-nginx-postgresql.zip',
        'php/nginx/mariadb'              => '/downloads/php-nginx-mariadb.zip',
        'fullstack/react-php/mysql-nginx' => '/downloads/fullstack-react-php-mysql.zip',
    ];

    return isset($templates[$templateId]) ? $templates[$templateId] : null;
}
