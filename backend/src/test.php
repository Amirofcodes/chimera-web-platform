<?php
header('Content-Type: application/json');

$response = [
    'status' => 'success',
    'message' => 'PHP processing is working correctly',
    'php_version' => phpversion(),
    'request_uri' => $_SERVER['REQUEST_URI'],
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'date' => date('Y-m-d H:i:s'),
    'environment' => [
        'MYSQL_HOST' => getenv('MYSQL_HOST') ?: 'Not set',
        'MYSQL_DB' => getenv('MYSQL_DB') ?: 'Not set',
        'JWT_SECRET' => getenv('JWT_SECRET') ? 'Set' : 'Not set',
        'PHP_ENVIRONMENT' => getenv('PHP_ENVIRONMENT') ?: 'Not set'
    ]
];

// Test database connection
try {
    if (getenv('MYSQL_HOST') && getenv('MYSQL_DB') && getenv('MYSQL_USER') && getenv('MYSQL_PASSWORD')) {
        $dsn = "mysql:host=" . getenv('MYSQL_HOST') . ";port=" . (getenv('MYSQL_PORT') ?: '3306') . ";dbname=" . getenv('MYSQL_DB');
        $pdo = new PDO($dsn, getenv('MYSQL_USER'), getenv('MYSQL_PASSWORD'));
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $response['database'] = [
            'status' => 'connected',
            'version' => $stmt->fetch(PDO::FETCH_ASSOC)['version']
        ];
    } else {
        $response['database'] = [
            'status' => 'not_configured',
            'message' => 'Database environment variables are not set'
        ];
    }
} catch (PDOException $e) {
    $response['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);