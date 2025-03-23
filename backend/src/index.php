<?php
// API with full authentication logic and private endpoints

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Add CORS headers for local development
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

header('Content-Type: application/json');

// Log the request URI for debugging
error_log("API Request: " . $_SERVER['REQUEST_URI']);

// Parse the request path and remove leading/trailing slashes
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($path, '/');

// Remove the "api/" prefix if present (if not already stripped by Nginx)
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Default to 'test' if the path is empty
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

// Route handling
switch ($path) {
    case 'test':
        echo json_encode(['success' => true, 'message' => 'API is working']);
        break;

    case 'dbtest':
        $pdo = getDbConnection();
        if ($pdo) {
            $stmt = $pdo->query("SELECT VERSION() AS version");
            $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
            echo json_encode(['success' => true, 'db_version' => $version]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
        }
        break;

    case 'auth/register':
        // Validate and register new user
        if (!$json_data || !isset($json_data['email']) || !isset($json_data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            break;
        }
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            break;
        }
        // Check for duplicate email
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$json_data['email']]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            break;
        }
        // Hash the password and insert the new user
        $password_hash = password_hash($json_data['password'], PASSWORD_DEFAULT);
        $name = $json_data['name'] ?? null;
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");
        try {
            $stmt->execute([$json_data['email'], $password_hash, $name]);
            $userId = $pdo->lastInsertId();
        } catch (PDOException $e) {
            error_log("Registration error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed', 'message' => $e->getMessage()]);
            break;
        }
        // Generate JWT token
        $token = generateJWT(['id' => $userId, 'email' => $json_data['email']]);
        echo json_encode([
            'success'      => true,
            'user'         => ['id' => $userId, 'email' => $json_data['email'], 'name' => $name],
            'access_token' => $token
        ]);
        break;

    case 'auth/login':
        // Validate and authenticate user
        if (!$json_data || !isset($json_data['email']) || !isset($json_data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            break;
        }
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            break;
        }
        // Retrieve user by email
        $stmt = $pdo->prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?");
        $stmt->execute([$json_data['email']]);
        if ($stmt->rowCount() === 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            break;
        }
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        // Verify password
        if (!password_verify($json_data['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            break;
        }
        // Generate JWT token
        $token = generateJWT(['id' => $user['id'], 'email' => $user['email']]);
        echo json_encode([
            'success'      => true,
            'user'         => ['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name']],
            'access_token' => $token
        ]);
        break;

    case 'auth/profile':
        // Retrieve user profile (protected endpoint)
        $user = authenticateRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }
        $pdo = getDbConnection();
        if (!$pdo) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            break;
        }
        $stmt = $pdo->prepare("SELECT id, email, name, created_at FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            break;
        }
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'user'    => $userData
        ]);
        break;

    // Password reset request handler
    case 'auth/request-reset':
        // Check if it's a POST request with email
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($json_data['email'])) {
            $email = $json_data['email'];

            // Check if user exists
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
            $stmt->execute([$email]);

            // Always return success even if email not found (security best practice)
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                // Generate reset token
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

                // Store token in database
                $storeToken = $pdo->prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
                $storeToken->execute([$user['id'], $token, $expires]);

                // In a real app, send an email with reset link
                // For now, just log it
                error_log("Password reset token for {$email}: {$token}");
            }

            echo json_encode([
                'success' => true,
                'message' => 'If an account exists with that email, a reset link has been sent'
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
        }
        break;

    // Reset password with token
    case 'auth/reset-password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($json_data['token']) && isset($json_data['password'])) {
            $token = $json_data['token'];
            $password = $json_data['password'];

            // Validate password (min 8 chars)
            if (strlen($password) < 8) {
                http_response_code(400);
                echo json_encode(['error' => 'Password must be at least 8 characters']);
                break;
            }

            $pdo = getDbConnection();

            // Find valid token
            $stmt = $pdo->prepare("
                SELECT t.user_id, t.token, u.email 
                FROM password_reset_tokens t
                JOIN users u ON t.user_id = u.id
                WHERE t.token = ? AND t.expires_at > NOW() AND t.used = 0
            ");
            $stmt->execute([$token]);

            if ($stmt->rowCount() === 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid or expired token']);
                break;
            }

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $user_id = $result['user_id'];

            // Update user's password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $updateStmt->execute([$password_hash, $user_id]);

            // Mark token as used
            $markUsed = $pdo->prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ?");
            $markUsed->execute([$token]);

            echo json_encode(['success' => true, 'message' => 'Password has been reset successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Token and new password are required']);
        }
        break;

    // Change password (authenticated endpoint)
    case 'auth/change-password':
        $user = authenticateRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }

        if (
            $_SERVER['REQUEST_METHOD'] === 'POST' &&
            isset($json_data['currentPassword']) &&
            isset($json_data['newPassword'])
        ) {

            $currentPassword = $json_data['currentPassword'];
            $newPassword = $json_data['newPassword'];

            // Validate new password (min 8 chars)
            if (strlen($newPassword) < 8) {
                http_response_code(400);
                echo json_encode(['error' => 'New password must be at least 8 characters']);
                break;
            }

            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verify current password
            if (!password_verify($currentPassword, $userData['password_hash'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password is incorrect']);
                break;
            }

            // Update password
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $updateStmt->execute([$newHash, $user['id']]);

            echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Current password and new password are required']);
        }
        break;

    case 'templates':
        // Public endpoint: list templates
        getTemplates();
        break;

    case 'templates/download':
        // Endpoint to download a template (requires authentication)
        handleTemplateDownload();
        break;

    case 'user/downloads':
        // Endpoint to retrieve user's download history (requires authentication)
        getUserDownloads();
        break;

    case 'dashboard':
        // Private dashboard endpoint (requires authentication)
        $user = authenticateRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }
        error_log("Dashboard accessed by user: " . $user['id']);
        echo json_encode([
            'success'   => true,
            'dashboard' => [
                'message' => 'Welcome to your dashboard',
                'user'    => $user,
                // Add additional dashboard data as needed
            ]
        ]);
        break;

    default:
        error_log("No route found for path: " . $path);
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
        break;
}

error_log("========= API REQUEST END =========");

/**
 * Establish a PDO database connection using environment variables.
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

/**
 * Generate a simple JWT token.
 * For production, consider using a robust JWT library.
 */
function generateJWT($payload)
{
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60 * 24); // 24-hour expiration
    $payload['iat'] = time();
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
}

/**
 * Verify a JWT token.
 */
function verifyJWT($token)
{
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
    $valid_signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $secret, true);
    if (!hash_equals($signature, $valid_signature)) {
        throw new Exception('Invalid token signature');
    }
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token has expired');
    }
    return $payload;
}

/**
 * Authenticate the request by verifying the JWT token in the Authorization header.
 */
function authenticateRequest()
{
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        return null;
    }
    $authHeader = $headers['Authorization'];
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    $token = substr($authHeader, 7);
    try {
        return verifyJWT($token);
    } catch (Exception $e) {
        error_log("Authentication error: " . $e->getMessage());
        return null;
    }
}

/**
 * Retrieve the list of templates.
 */
function getTemplates()
{
    try {
        $pdo = getDbConnection();
        if (!$pdo) {
            provideStaticTemplates();
            return;
        }
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
        echo json_encode([
            'success'   => true,
            'templates' => $templates
        ]);
    } catch (PDOException $e) {
        error_log("Error fetching templates: " . $e->getMessage());
        provideStaticTemplates();
    }
}

/**
 * Provide static templates if the database is unavailable.
 */
function provideStaticTemplates()
{
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

/**
 * Handle template download requests.
 */
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
    $download_url = getTemplateDownloadUrl($template_id);
    if (!$download_url) {
        http_response_code(404);
        echo json_encode(['error' => 'Template not found']);
        return;
    }
    try {
        $pdo = getDbConnection();
        if ($pdo) {
            $stmt = $pdo->prepare("INSERT INTO template_downloads (user_id, template_id, download_date) VALUES (?, ?, NOW())");
            $stmt->execute([$user['id'], $template_id]);
        }
        $file_path = __DIR__ . $download_url;
        $file_size = file_exists($file_path) ? filesize($file_path) : '1024 KB';
        echo json_encode([
            'success'      => true,
            'template_id'  => $template_id,
            'message'      => 'Template download ready',
            'download_url' => $download_url,
            'size'         => $file_size
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

/**
 * Retrieve the user's download history.
 */
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

/**
 * Get the download URL for a given template ID.
 */
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
