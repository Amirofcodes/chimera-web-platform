<?php

/**
 * Database connection handler.
 */

/**
 * Establish a PDO database connection using environment variables.
 * @return PDO|null Database connection or null on failure
 */
function getDbConnection()
{
    $host = getenv('MYSQL_HOST');
    $port = getenv('MYSQL_PORT');
    $db   = getenv('MYSQL_DB');
    $user = getenv('MYSQL_USER');
    $pass = getenv('MYSQL_PASSWORD');

    if (!$host || !$db || !$user || !$pass) {
        error_log("Missing database environment variables");
        return null;
    }

    try {
        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}
