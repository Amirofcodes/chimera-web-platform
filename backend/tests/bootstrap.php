<?php

require_once __DIR__ . '/../vendor/autoload.php';

// Configuration de l'environnement de test
putenv('MYSQL_HOST=mysql');
putenv('MYSQL_USER=root');
putenv('MYSQL_PASSWORD=root_password');
putenv('MYSQL_DB=chimera_test');
putenv('JWT_SECRET=test_secret_key');

// Initialisation de la base de données de test si nécessaire
function initTestDatabase()
{
    $host = getenv('MYSQL_HOST');
    $user = getenv('MYSQL_USER');
    $pass = getenv('MYSQL_PASSWORD');
    $db = getenv('MYSQL_DB');

    try {
        $pdo = new PDO("mysql:host=$host", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Créer la base de test si elle n'existe pas
        $pdo->exec("CREATE DATABASE IF NOT EXISTS $db");
        $pdo->exec("USE $db");

        // Charger le fichier SQL d'initialisation
        $sql = file_get_contents(__DIR__ . '/fixtures/init_test_db.sql');
        $pdo->exec($sql);

        echo "Base de données de test initialisée avec succès\n";
    } catch (PDOException $e) {
        echo "Erreur d'initialisation de la base de données: " . $e->getMessage() . "\n";
        exit(1);
    }
}

initTestDatabase();
