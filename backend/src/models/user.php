<?php
/**
 * User Model Functions
 *
 * This file contains functions for managing user data including:
 * - Retrieving user details by ID or email.
 * - Creating new users with hashed passwords.
 * - Updating user passwords and profile images.
 * - Handling password reset tokens.
 * - Retrieving a user's download history.
 */

// Include the database connection helper.
require_once __DIR__ . '/../core/database.php';

/**
 * Get user details by user ID.
 *
 * This function retrieves a user's record from the database including
 * email, name, creation date, profile image, and the password hash.
 *
 * @param int $userId User ID.
 * @return array|null Associative array of user data or null if not found.
 */
function getUserById($userId)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Prepare a query to fetch the user's details.
    $stmt = $pdo->prepare("SELECT id, email, name, created_at, profile_image, password_hash FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    // If no user is found, return null.
    if ($stmt->rowCount() === 0) {
        return null;
    }

    // Return the user record as an associative array.
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get user details by email.
 *
 * This function retrieves a user's record using their email address.
 *
 * @param string $email User email.
 * @return array|null Associative array of user data or null if not found.
 */
function getUserByEmail($email)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Prepare a query to fetch user details by email.
    $stmt = $pdo->prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);

    // Return null if no matching user is found.
    if ($stmt->rowCount() === 0) {
        return null;
    }

    // Return the user record.
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Create a new user.
 *
 * This function creates a new user record in the database after ensuring
 * that the email is not already registered. It hashes the password before
 * storing it.
 *
 * @param string      $email    User email.
 * @param string      $password Plain text password (will be hashed).
 * @param string|null $name     Optional user name.
 * @return int|null New user ID on success or null on failure.
 */
function createUser($email, $password, $name = null)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Check for duplicate email to prevent multiple registrations.
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        return null;
    }

    // Hash the password securely using the default algorithm.
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Prepare the query to insert the new user record.
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");

    try {
        // Execute the insert statement with provided parameters.
        $stmt->execute([$email, $password_hash, $name]);
        // Return the new user's ID.
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Error creating user: " . $e->getMessage());
        return null;
    }
}

/**
 * Update a user's password.
 *
 * This function updates the password of an existing user by hashing the new password.
 *
 * @param int    $userId      User ID.
 * @param string $newPassword New plain text password (will be hashed).
 * @return bool True on success, false on failure.
 */
function updateUserPassword($userId, $newPassword)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    // Hash the new password.
    $password_hash = password_hash($newPassword, PASSWORD_DEFAULT);
    // Prepare the update statement.
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");

    try {
        // Execute the update query with the hashed password.
        $stmt->execute([$password_hash, $userId]);
        return true;
    } catch (PDOException $e) {
        error_log("Error updating password: " . $e->getMessage());
        return false;
    }
}

/**
 * Update a user's profile image.
 *
 * This function updates the profile_image field of the user's record with the new image path.
 *
 * @param int    $userId    User ID.
 * @param string $imagePath Path to the new profile image.
 * @return bool True on success, false on failure.
 */
function updateUserProfileImage($userId, $imagePath)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    // Prepare the update statement for the profile image.
    $stmt = $pdo->prepare("UPDATE users SET profile_image = ? WHERE id = ?");

    try {
        // Execute the update with the new image path.
        $stmt->execute([$imagePath, $userId]);
        return true;
    } catch (PDOException $e) {
        error_log("Error updating profile image: " . $e->getMessage());
        return false;
    }
}

/**
 * Create a password reset token.
 *
 * This function generates a secure random token, sets an expiration time (1 hour),
 * and inserts a record into the password_reset_tokens table.
 *
 * @param int $userId User ID.
 * @return string|null The generated token on success or null on failure.
 */
function createPasswordResetToken($userId)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Generate a secure random token.
    $token = bin2hex(random_bytes(32));
    // Set token expiration to 1 hour from now.
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Prepare the insert statement for the password reset token.
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
 * Retrieve valid password reset token information.
 *
 * This function fetches token data that is still valid (not expired and not used),
 * joining with the users table to also return the user's email.
 *
 * @param string $token The reset token.
 * @return array|null Associative array with token data or null if invalid/expired.
 */
function getValidResetToken($token)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Prepare a query to join password_reset_tokens with users and check token validity.
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
 * Mark a password reset token as used.
 *
 * This function updates a token record to indicate that it has been used,
 * preventing its reuse.
 *
 * @param string $token The reset token to mark as used.
 * @return bool True on success, false on failure.
 */
function markResetTokenUsed($token)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    // Prepare the update statement for the reset token.
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
 * Retrieve a user's download history.
 *
 * This function fetches the most recent template downloads for the user by joining
 * the template_downloads and templates tables, sorted by download date.
 *
 * @param int $userId User ID.
 * @param int $limit  Maximum number of records to return (default is 10).
 * @return array List of download history records.
 */
function getUserDownloadHistory($userId, $limit = 10)
{
    $pdo = getDbConnection();
    if (!$pdo) return [];

    // Prepare the query to retrieve download history, joining templates to include template names.
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
