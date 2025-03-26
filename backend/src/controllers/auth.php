<?php

/**
 * Authentication controller.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/user.php';

/**
 * Handle login route.
 */
function handleLogin()
{
    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['email']) || !isset($json_data['password'])) {
        sendErrorResponse('Email and password are required', 400);
    }

    $user = getUserByEmail($json_data['email']);

    if (!$user || !password_verify($json_data['password'], $user['password_hash'])) {
        sendErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    $token = generateJWT(['id' => $user['id'], 'email' => $user['email']]);

    sendSuccessResponse([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'] ?? null
        ],
        'access_token' => $token
    ]);
}

/**
 * Handle register route.
 */
function handleRegister()
{
    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['email']) || !isset($json_data['password'])) {
        sendErrorResponse('Email and password are required', 400);
    }

    $email = $json_data['email'];
    $password = $json_data['password'];
    $name = $json_data['name'] ?? null;

    if (getUserByEmail($email)) {
        sendErrorResponse('Email already exists', 409);
    }

    $userId = createUser($email, $password, $name);

    if (!$userId) {
        sendErrorResponse('Registration failed', 500);
    }

    $token = generateJWT(['id' => $userId, 'email' => $email]);

    sendSuccessResponse([
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name
        ],
        'access_token' => $token
    ]);
}

/**
 * Handle profile route.
 */
function handleProfile()
{
    $user = authenticateRequest();

    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    $userData = getUserById($user['id']);

    if (!$userData) {
        sendErrorResponse('User not found', 404);
    }

    sendSuccessResponse(['user' => $userData]);
}

/**
 * Handle password reset request.
 */
function handlePasswordResetRequest()
{
    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['email'])) {
        sendErrorResponse('Email is required', 400);
    }

    $email = $json_data['email'];
    $user = getUserByEmail($email);

    // Always return success for security (don't reveal if email exists)
    if ($user) {
        $token = createPasswordResetToken($user['id']);
        // In a real app, send an email with reset link
        error_log("Password reset token for {$email}: {$token}");
    }

    sendSuccessResponse([
        'message' => 'If an account exists with that email, a reset link has been sent'
    ]);
}

/**
 * Handle password reset.
 */
function handlePasswordReset()
{
    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['token']) || !isset($json_data['password'])) {
        sendErrorResponse('Token and new password are required', 400);
    }

    $token = $json_data['token'];
    $password = $json_data['password'];

    // Validate password (min 8 chars)
    if (strlen($password) < 8) {
        sendErrorResponse('Password must be at least 8 characters', 400);
    }

    $tokenData = getValidResetToken($token);

    if (!$tokenData) {
        sendErrorResponse('Invalid or expired token', 400);
    }

    $userId = $tokenData['user_id'];

    if (!updateUserPassword($userId, $password)) {
        sendErrorResponse('Failed to update password', 500);
    }

    markResetTokenUsed($token);

    sendSuccessResponse(['message' => 'Password has been reset successfully']);
}

/**
 * Handle password change.
 */
function handlePasswordChange()
{
    $user = authenticateRequest();

    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['currentPassword']) || !isset($json_data['newPassword'])) {
        sendErrorResponse('Current password and new password are required', 400);
    }

    $currentPassword = $json_data['currentPassword'];
    $newPassword = $json_data['newPassword'];

    // Validate new password (min 8 chars)
    if (strlen($newPassword) < 8) {
        sendErrorResponse('New password must be at least 8 characters', 400);
    }

    $userData = getUserById($user['id']);

    // Verify current password
    if (!password_verify($currentPassword, $userData['password_hash'])) {
        sendErrorResponse('Current password is incorrect', 400);
    }

    if (!updateUserPassword($user['id'], $newPassword)) {
        sendErrorResponse('Failed to update password', 500);
    }

    sendSuccessResponse(['message' => 'Password updated successfully']);
}

/**
 * Handle profile picture upload.
 */
function handleProfilePictureUpload()
{
    $user = authenticateRequest();

    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    if (!isset($_FILES['profile_image'])) {
        sendErrorResponse('No image file provided', 400);
    }

    $file = $_FILES['profile_image'];

    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowed_types)) {
        sendErrorResponse('Only JPG, PNG, and GIF images are allowed', 400);
    }

    // Validate file size (max 2MB)
    if ($file['size'] > 2 * 1024 * 1024) {
        sendErrorResponse('Image size should not exceed 2MB', 400);
    }

    // Generate unique filename and set upload path
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $user['id'] . '_' . time() . '.' . $ext;
    $upload_path = __DIR__ . '/../uploads/profile/';

    // Create directory if it doesn't exist
    if (!file_exists($upload_path)) {
        mkdir($upload_path, 0755, true);
    }

    $destination = $upload_path . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        sendErrorResponse('Failed to upload image', 500);
    }

    // --- Image Optimization using GD ---
    // Define maximum dimensions for the profile image
    $maxWidth = 300;
    $maxHeight = 300;

    // Load the image based on its MIME type
    switch ($file['type']) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($destination);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($destination);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($destination);
            break;
        default:
            $sourceImage = null;
    }

    if ($sourceImage) {
        $width = imagesx($sourceImage);
        $height = imagesy($sourceImage);

        // Calculate the scaling ratio while preserving aspect ratio
        $ratio = min($maxWidth / $width, $maxHeight / $height);
        if ($ratio < 1) {
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            // Preserve transparency for PNG and GIF images
            if ($file['type'] == 'image/png') {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
            } elseif ($file['type'] == 'image/gif') {
                $transparentIndex = imagecolortransparent($sourceImage);
                if ($transparentIndex >= 0) {
                    $transparentColor = imagecolorsforindex($sourceImage, $transparentIndex);
                    $transparentIndex = imagecolorallocate($resizedImage, $transparentColor['red'], $transparentColor['green'], $transparentColor['blue']);
                    imagefill($resizedImage, 0, 0, $transparentIndex);
                    imagecolortransparent($resizedImage, $transparentIndex);
                }
            }

            // Resample the original image into the resized canvas
            imagecopyresampled(
                $resizedImage,
                $sourceImage,
                0,
                0,
                0,
                0,
                $newWidth,
                $newHeight,
                $width,
                $height
            );

            // Save the optimized image back to disk
            switch ($file['type']) {
                case 'image/jpeg':
                    imagejpeg($resizedImage, $destination, 85); // 85% quality
                    break;
                case 'image/png':
                    imagepng($resizedImage, $destination, 6); // Compression level 6 (0-9)
                    break;
                case 'image/gif':
                    imagegif($resizedImage, $destination);
                    break;
            }
            imagedestroy($resizedImage);
        }
        imagedestroy($sourceImage);
    }
    // --- End Image Optimization ---

    $backend_base_url = 'http://localhost:8000';
    $image_url = $backend_base_url . '/uploads/profile/' . $filename;
    if (!updateUserProfileImage($user['id'], $image_url)) {
        sendErrorResponse('Failed to update profile image in database', 500);
    }

    sendSuccessResponse([
        'message' => 'Profile picture updated successfully',
        'image_url' => $image_url
    ]);
}


/**
 * Route auth requests to appropriate handlers.
 * @param string $path Request path
 */
function routeAuthRequest($path)
{
    $authPath = substr($path, 5); // Remove 'auth/' prefix

    switch ($authPath) {
        case 'login':
            handleLogin();
            break;

        case 'register':
            handleRegister();
            break;

        case 'profile':
            handleProfile();
            break;

        case 'request-reset':
            handlePasswordResetRequest();
            break;

        case 'reset-password':
            handlePasswordReset();
            break;

        case 'change-password':
            handlePasswordChange();
            break;

        case 'upload-profile-picture':
            handleProfilePictureUpload();
            break;

        default:
            sendErrorResponse('Auth endpoint not found', 404);
    }
}
