<?php
/**
 * Template Model Functions
 *
 * This file contains functions that interact with the database to retrieve and manage
 * template data, including fetching all templates, retrieving a specific template by ID,
 * recording a template download, and returning a download URL.
 */

// Include the database connection helper.
require_once __DIR__ . '/../core/database.php';

/**
 * Retrieve all templates from the database.
 *
 * This function fetches the basic template details from the database and then enhances
 * each template record with additional data such as tags (based on the description) and
 * the download count from the template_downloads table.
 *
 * @return array List of templates with additional information.
 */
function getAllTemplates()
{
    // Establish a database connection.
    $pdo = getDbConnection();
    if (!$pdo) {
        return []; // Return an empty array if the database connection fails.
    }

    try {
        // Query to select template information.
        $stmt = $pdo->query("SELECT id, name, description, category FROM templates");
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Loop through each template to add extra details.
        foreach ($templates as &$template) {
            $tags = [];
            // Add tag if the description contains specific keywords.
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
            // Add the computed tags to the template.
            $template['tags'] = $tags;

            // Prepare a statement to count downloads for the template.
            $stmtCount = $pdo->prepare("SELECT COUNT(*) as downloads FROM template_downloads WHERE template_id = ?");
            $stmtCount->execute([$template['id']]);
            // Store the download count as an integer.
            $template['downloads'] = (int)$stmtCount->fetch(PDO::FETCH_ASSOC)['downloads'];
        }

        return $templates;
    } catch (PDOException $e) {
        error_log("Error fetching templates: " . $e->getMessage());
        return [];
    }
}

/**
 * Retrieve a template by its ID.
 *
 * This function searches through the list of all templates and returns the template
 * that matches the given ID. If no template is found, it returns null.
 *
 * @param string $templateId The ID of the template.
 * @return array|null Template data or null if not found.
 */
function getTemplateById($templateId)
{
    // Get all templates.
    $templates = getAllTemplates();
    // Loop through each template to find a match.
    foreach ($templates as $template) {
        if ($template['id'] === $templateId) {
            return $template;
        }
    }
    return null;
}

/**
 * Record a template download event.
 *
 * This function inserts a record into the template_downloads table with the user's ID,
 * the template ID, and the current date/time as the download date.
 *
 * @param int    $userId     The ID of the user downloading the template.
 * @param string $templateId The ID of the template being downloaded.
 * @return bool True if the download is recorded successfully, false otherwise.
 */
function recordTemplateDownload($userId, $templateId)
{
    // Establish a database connection.
    $pdo = getDbConnection();
    if (!$pdo) return false;

    // Prepare the SQL statement for inserting a new download record.
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
 * Get the download URL for a specific template.
 *
 * This function returns a predefined download URL for a given template ID. If the template
 * ID does not exist in the mapping, it returns null.
 *
 * @param string $templateId The ID of the template.
 * @return string|null The download URL for the template, or null if not found.
 */
function getTemplateDownloadUrl($templateId)
{
    // Define a mapping of template IDs to their corresponding download URLs.
    $templates = [
        'php/nginx/mysql'                => '/downloads/php-nginx-mysql.zip',
        'php/nginx/postgresql'           => '/downloads/php-nginx-postgresql.zip',
        'php/nginx/mariadb'              => '/downloads/php-nginx-mariadb.zip',
        'fullstack/react-php/mysql-nginx' => '/downloads/fullstack-react-php-mysql.zip',
    ];

    // Return the URL if it exists, otherwise return null.
    return isset($templates[$templateId]) ? $templates[$templateId] : null;
}
