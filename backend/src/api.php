<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the request path
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Remove /api prefix
$path = trim($path, '/');
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Handle OPTIONS requests (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get JSON request body for POST requests
$json_data = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json_data = json_decode(file_get_contents('php://input'), true);
}

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
        if (isset($_GET['id'])) {
            downloadTemplate($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Template ID is required']);
        }
        break;
    default:
        echo json_encode(['message' => 'Welcome to the API!']);
        break;
}

function handleRegister($data) {
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    try {
        $host = getenv('MYSQL_HOST');
        $port = getenv('MYSQL_PORT');
        $db   = getenv('MYSQL_DB');
        $user = getenv('MYSQL_USER');
        $pass = getenv('MYSQL_PASSWORD');

        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
            'success' => true,
            'user' => [
                'id' => $userId,
                'email' => $data['email'],
                'name' => $name
            ],
            'access_token' => $token
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Registration failed',
            'message' => $e->getMessage()
        ]);
    }
}

function handleLogin($data) {
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    try {
        $host = getenv('MYSQL_HOST');
        $port = getenv('MYSQL_PORT');
        $db   = getenv('MYSQL_DB');
        $user = getenv('MYSQL_USER');
        $pass = getenv('MYSQL_PASSWORD');

        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Find user by email (ensure the table name is correct; here, assumed to be 'users')
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
        error_log("Generated token: " . $token);
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'], 
                'name' => $user['name']
            ],
            'access_token' => $token
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Login failed',
            'message' => $e->getMessage()
        ]);
    }
}


function handleProfile() {
    $headers = getallheaders();
    $token = null;

    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (strpos($auth_header, 'Bearer ') === 0) {
            $token = substr($auth_header, 7);
        }
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    try {
        $payload = verifyJWT($token);
        
        $host = getenv('MYSQL_HOST');
        $port = getenv('MYSQL_PORT');
        $db   = getenv('MYSQL_DB');
        $user = getenv('MYSQL_USER');
        $pass = getenv('MYSQL_PASSWORD');

        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Get user details
        $stmt = $pdo->prepare("SELECT id, email, name, created_at FROM users WHERE id = ?");
        $stmt->execute([$payload['id']]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Invalid token',
            'message' => $e->getMessage()
        ]);
    }
}

function getTemplates() {
    // For now, return static template data from the CLI
    $templates = [
        [
            'id' => 'php/nginx/mysql',
            'name' => 'PHP/Nginx/MySQL Stack',
            'description' => 'PHP development environment with Nginx web server and MySQL database',
            'tags' => ['php', 'mysql', 'nginx'],
            'downloads' => 1250
        ],
        [
            'id' => 'php/nginx/postgresql',
            'name' => 'PHP/Nginx/PostgreSQL Stack',
            'description' => 'PHP development environment with Nginx web server and PostgreSQL database',
            'tags' => ['php', 'postgresql', 'nginx'],
            'downloads' => 820
        ],
        [
            'id' => 'php/nginx/mariadb',
            'name' => 'PHP/Nginx/MariaDB Stack',
            'description' => 'PHP development environment with Nginx web server and MariaDB database',
            'tags' => ['php', 'mariadb', 'nginx'],
            'downloads' => 960
        ],
        [
            'id' => 'fullstack/react-php/mysql-nginx',
            'name' => 'React/PHP/MySQL Fullstack Stack',
            'description' => 'Complete fullstack development environment with React, PHP backend, and MySQL database',
            'tags' => ['react', 'php', 'mysql', 'fullstack'],
            'downloads' => 1840
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'templates' => $templates
    ]);
}

function downloadTemplate($id) {
    // This would normally create a zip file of the template, but for now just return a success message
    echo json_encode([
        'success' => true,
        'message' => "Template $id download initiated",
        'download_url' => "/downloads/template_$id.zip"
    ]);
}

function checkDatabaseStatus() {
    try {
        $host = getenv('MYSQL_HOST');
        $port = getenv('MYSQL_PORT');
        $db   = getenv('MYSQL_DB');
        $user = getenv('MYSQL_USER');
        $pass = getenv('MYSQL_PASSWORD');

        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Get MySQL version
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];

        echo json_encode([
            'success' => true,
            'version' => $version,
            'message' => 'Database connection successful',
            'config' => [
                'host' => $host,
                'port' => $port,
                'database' => $db,
                'user' => $user
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'config' => [
                'host' => $host,
                'port' => $port,
                'database' => $db,
                'user' => $user
            ]
        ]);
    }
}

// JWT helper functions
function generateJWT($payload) {
    $secret = 'your-secret-key'; // In production, use a secure environment variable
    
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (60 * 60); // 1 hour expiration
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    $secret = 'your-secret-key'; // Must match the secret used to generate the token
    
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