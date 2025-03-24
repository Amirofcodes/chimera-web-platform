<?php

/**
 * User model functions.
 */
require_once __DIR__ . '/../core/database.php';

/**
 * Get user by ID.
 * @param int $userId User ID
 * @return array|null User data or null if not found
 */
function getUserById($userId)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Updated query to include password_hash
    $stmt = $pdo->prepare("SELECT id, email, name, created_at, profile_image, password_hash FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() === 0) {
        return null;
    }

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get user by email.
 * @param string $email User email
 * @return array|null User data or null if not found
 */
function getUserByEmail($email)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    $stmt = $pdo->prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() === 0) {
        return null;
    }

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Create a new user.
 * @param string $email Email
 * @param string $password Password (will be hashed)
 * @param string|null $name Optional name
 * @return int|null New user ID or null on failure
 */
function createUser($email, $password, $name = null)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Check for duplicate email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        return null;
    }

    // Hash password and insert user
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");

    try {
        $stmt->execute([$email, $password_hash, $name]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Error creating user: " . $e->getMessage());
        return null;
    }
}

/**
 * Update user's password.
 * @param int $userId User ID
 * @param string $newPassword New password (will be hashed)
 * @return bool Success status
 */
function updateUserPassword($userId, $newPassword)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    $password_hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");

    try {
        $stmt->execute([$password_hash, $userId]);
        return true;
    } catch (PDOException $e) {
        error_log("Error updating password: " . $e->getMessage());
        return false;
    }
}

/**
 * Update user's profile image.
 * @param int $userId User ID
 * @param string $imagePath Path to store
 * @return bool Success status
 */
function updateUserProfileImage($userId, $imagePath)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    $stmt = $pdo->prepare("UPDATE users SET profile_image = ? WHERE id = ?");

    try {
        $stmt->execute([$imagePath, $userId]);
        return true;
    } catch (PDOException $e) {
        error_log("Error updating profile image: " . $e->getMessage());
        return false;
    }
}

/**
 * Create password reset token.
 * @param int $userId User ID
 * @return string|null Token or null on failure
 */
function createPasswordResetToken($userId)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $pdo->prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");

    try {
        $stmt->execute([$userId, $token, $expires]);
        return $token;
    } catch (PDOException $e) {
        error_log("Error creating reset token: " . $e->getMessage());
        return null;
    }
}

/**
 * Get valid reset token info.
 * @param string $token Reset token
 * @return array|null Token data or null if invalid
 */
function getValidResetToken($token)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    $stmt = $pdo->prepare("
        SELECT t.user_id, t.token, u.email
        FROM password_reset_tokens t
        JOIN users u ON t.user_id = u.id
        WHERE t.token = ? AND t.expires_at > NOW() AND t.used = 0
    ");

    $stmt->execute([$token]);

    if ($stmt->rowCount() === 0) {
        return null;
    }

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Mark reset token as used.
 * @param string $token Reset token
 * @return bool Success status
 */
function markResetTokenUsed($token)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    $stmt = $pdo->prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ?");

    try {
        $stmt->execute([$token]);
        return true;
    } catch (PDOException $e) {
        error_log("Error marking token used: " . $e->getMessage());
        return false;
    }
}

/**
 * Get user download history.
 * @param int $userId User ID
 * @param int $limit Max number of records to return
 * @return array Download history
 */
function getUserDownloadHistory($userId, $limit = 10)
{
    $pdo = getDbConnection();
    if (!$pdo) return [];

    $stmt = $pdo->prepare("
        SELECT td.template_id, t.name as template_name, td.download_date
        FROM template_downloads td
        JOIN templates t ON td.template_id = t.id
        WHERE td.user_id = ?
        ORDER BY td.download_date DESC
        LIMIT ?
    ");

    try {
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error fetching downloads: " . $e->getMessage());
        return [];
    }
}
