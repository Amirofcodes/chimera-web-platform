<?php
// Set error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configure headers for JSON API and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// --- API Path Normalization ---

// Log the original request URI for debugging
error_log("Original REQUEST_URI: " . $_SERVER['REQUEST_URI']);

// Parse the URI and remove leading/trailing slashes
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($path, '/');

// Remove the "api/" prefix if present
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// If the path is empty, default to the test endpoint
if (empty($path)) {
    $path = 'test';
}

error_log("Normalized path: " . $path);
error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("CONTENT TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set'));

// Log all request headers for debugging
$headers = getallheaders();
error_log("REQUEST HEADERS: " . json_encode($headers));

// Read raw JSON input for POST requests
$raw_input = file_get_contents('php://input');
error_log("RAW INPUT: " . $raw_input);
$json_data = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json_data = json_decode($raw_input, true);
    error_log("JSON DATA: " . json_encode($json_data));
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON ERROR: " . json_last_error_msg());
    }
}

// --- Route Requests Based on the Normalized Path ---
switch ($path) {
    case 'auth/register':
        handleRegister($json_data);
        break;
    case 'auth/login':
        handleLogin($json_data);
        break;
    case 'auth/profile':
        handleProfile();
        break;
    case 'db-status':
        checkDatabaseStatus();
        break;
    case 'templates':
        getTemplates();
        break;
    case 'templates/download':
        handleTemplateDownload();
        break;
    case 'user/downloads':
        getUserDownloads();
        break;
    case 'test':
        // Simple test endpoint
        echo json_encode(['success' => true, 'message' => 'API is working']);
        break;
    default:
        error_log("No route found for path: " . $path);
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found', 'path' => $path]);
        break;
}

error_log("========= API REQUEST END =========");

// ====================
// Function definitions
// ====================

function handleRegister($data)
{
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            return;
        }

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);

        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }

        // Hash password
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");
        $name = $data['name'] ?? null;
        $stmt->execute([$data['email'], $password_hash, $name]);

        $userId = $pdo->lastInsertId();

        // Create JWT token
        $token = generateJWT(['id' => $userId, 'email' => $data['email']]);

        echo json_encode([
            'success'      => true,
            'user'         => [
                'id'    => $userId,
                'email' => $data['email'],
                'name'  => $name
            ],
            'access_token' => $token
        ]);
    } catch (PDOException $e) {
        error_log("Registration error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error'   => 'Registration failed',
            'message' => $e->getMessage()
        ]);
    }
}

function handleLogin($data)
{
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            return;
        }

        // Find user by email
        $stmt = $pdo->prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);

        if ($stmt->rowCount() === 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify password
        if (!password_verify($data['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        // Create JWT token
        $token = generateJWT(['id' => $user['id'], 'email' => $user['email']]);
        error_log("Login successful for user: " . $user['email']);

        echo json_encode([
            'success'      => true,
            'user'         => [
                'id'    => $user['id'],
                'email' => $user['email'],
                'name'  => $user['name']
            ],
            'access_token' => $token
        ]);
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error'   => 'Login failed',
            'message' => $e->getMessage()
        ]);
    }
}

function handleProfile()
{
    $user = authenticateRequest();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            return;
        }

        // Get user details
        $stmt = $pdo->prepare("SELECT id, email, name, created_at FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'user'    => $userData
        ]);
    } catch (PDOException $e) {
        error_log("Profile fetch error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error'   => 'Failed to get profile',
            'message' => $e->getMessage()
        ]);
    }
}

function handleTemplateDownload()
{
    $user = authenticateRequest();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Template ID is required']);
        return;
    }

    $template_id = $_GET['id'];

    // Get the static download URL
    $download_url = getTemplateDownloadUrl($template_id);
    if (!$download_url) {
        http_response_code(404);
        echo json_encode(['error' => 'Template not found']);
        return;
    }

    try {
        $pdo = getDbConnection();
        if ($pdo) {
            // Record download in database
            $stmt = $pdo->prepare("INSERT INTO template_downloads (user_id, template_id, download_date) VALUES (?, ?, NOW())");
            $stmt->execute([$user['id'], $template_id]);
        }

        // File size calculation using the physical file in the downloads directory
        $file_path = __DIR__ . $download_url;
        $file_size = file_exists($file_path) ? filesize($file_path) : '1024 KB';

        echo json_encode([
            'success'     => true,
            'template_id' => $template_id,
            'message'     => 'Template download ready',
            'download_url' => $download_url,
            'size'        => $file_size
        ]);
    } catch (Exception $e) {
        error_log("Download error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error'   => 'Download failed',
            'message' => $e->getMessage()
        ]);
    }
}

function getUserDownloads()
{
    $user = authenticateRequest();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            return;
        }

        // Get user download history
        $stmt = $pdo->prepare("
            SELECT td.template_id, t.name as template_name, td.download_date 
            FROM template_downloads td
            JOIN templates t ON td.template_id = t.id
            WHERE td.user_id = ?
            ORDER BY td.download_date DESC
            LIMIT 10
        ");
        $stmt->execute([$user['id']]);
        $downloads = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success'   => true,
            'downloads' => $downloads
        ]);
    } catch (Exception $e) {
        error_log("Failed to retrieve download history: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error'   => 'Failed to retrieve download history',
            'message' => $e->getMessage()
        ]);
    }
}

function checkDatabaseStatus()
{
    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => 'Database connection failed'
            ]);
            return;
        }

        // Get MySQL version
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];

        echo json_encode([
            'success' => true,
            'version' => $version,
            'message' => 'Database connection successful',
            'config'  => [
                'host'     => getenv('MYSQL_HOST'),
                'port'     => getenv('MYSQL_PORT'),
                'database' => getenv('MYSQL_DB'),
                'user'     => getenv('MYSQL_USER')
            ]
        ]);
    } catch (PDOException $e) {
        error_log("Database status check error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => $e->getMessage()
        ]);
    }
}

function getTemplates()
{
    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            // Fallback to static data if database isn't available
            provideStaticTemplates();
            return;
        }

        $stmt = $pdo->query("SELECT id, name, description, category FROM templates");
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Enhance with additional data
        foreach ($templates as &$template) {
            // Add sample tags based on description
            $tags = [];
            if (strpos($template['description'], 'PHP') !== false) $tags[] = 'php';
            if (strpos($template['description'], 'MySQL') !== false) $tags[] = 'mysql';
            if (strpos($template['description'], 'PostgreSQL') !== false) $tags[] = 'postgresql';
            if (strpos($template['description'], 'MariaDB') !== false) $tags[] = 'mariadb';
            if (strpos($template['description'], 'Nginx') !== false) $tags[] = 'nginx';
            if (strpos($template['description'], 'React') !== false) $tags[] = 'react';
            if (strpos($template['description'], 'Fullstack') !== false) $tags[] = 'fullstack';

            $template['tags'] = $tags;

            // Get download count
            $stmt = $pdo->prepare("SELECT COUNT(*) as downloads FROM template_downloads WHERE template_id = ?");
            $stmt->execute([$template['id']]);
            $template['downloads'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['downloads'];
        }

        echo json_encode([
            'success'   => true,
            'templates' => $templates
        ]);
    } catch (PDOException $e) {
        error_log("Error fetching templates: " . $e->getMessage());
        // Fallback to static data
        provideStaticTemplates();
    }
}

function provideStaticTemplates()
{
    // Static templates as fallback
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

    echo json_encode([
        'success'   => true,
        'templates' => $templates
    ]);
}

function getTemplateDownloadUrl($template_id)
{
    $templates = [
        'php/nginx/mysql'                => '/downloads/php-nginx-mysql.zip',
        'php/nginx/postgresql'           => '/downloads/php-nginx-postgresql.zip',
        'php/nginx/mariadb'              => '/downloads/php-nginx-mariadb.zip',
        'fullstack/react-php/mysql-nginx' => '/downloads/fullstack-react-php-mysql.zip',
    ];

    return isset($templates[$template_id]) ? $templates[$template_id] : null;
}

// JWT helper functions
function generateJWT($payload)
{
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60 * 24); // 24 hour expiration
    $payload['iat'] = time(); // Issued at time
    $payload = json_encode($payload);

    $base64UrlHeader  = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token)
{
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));

    $valid_signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);

    if (!hash_equals($signature, $valid_signature)) {
        throw new Exception('Invalid token signature');
    }

    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);

    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token has expired');
    }

    return $payload;
}
