<?php
/**
 * Authentication Controller
 *
 * This file manages user authentication tasks including:
 * - User login: validating credentials and generating JWT tokens.
 * - User registration: creating new accounts and issuing tokens.
 * - Profile management: retrieving user profile details.
 * - Password management: handling password reset requests, resets using tokens, and password changes.
 * - Profile picture uploads: validating, optimizing, and updating user profile images.
 *
 * Core dependencies for database access, JWT authentication, and response formatting are required.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/user.php';

/**
 * Handle user login.
 *
 * This function:
 * - Retrieves the JSON payload from the request.
 * - Validates that the email and password fields are provided.
 * - Fetches the user from the database based on the email.
 * - Verifies the provided password against the stored hash.
 * - Generates a JWT token upon successful authentication.
 * - Returns the user information and the generated token.
 */
function handleLogin()
{
    $json_data = getJsonData();

    // Validate that both email and password are provided.
    if (!$json_data || !isset($json_data['email']) || !isset($json_data['password'])) {
        sendErrorResponse('Email and password are required', 400);
    }

    // Retrieve the user record using the provided email.
    $user = getUserByEmail($json_data['email']);

    // Verify that the user exists and the password matches.
    if (!$user || !password_verify($json_data['password'], $user['password_hash'])) {
        sendErrorResponse('Invalid credentials', 401);
    }

    // Generate a JWT token using the user's id and email.
    $token = generateJWT(['id' => $user['id'], 'email' => $user['email']]);

    // Respond with the user details and the JWT token.
    sendSuccessResponse([
        'user' => [
            'id'    => $user['id'],
            'email' => $user['email'],
            'name'  => $user['name'] ?? null
        ],
        'access_token' => $token
    ]);
}

/**
 * Handle user registration.
 *
 * This function:
 * - Retrieves the JSON payload from the request.
 * - Validates that required fields (email and password) are provided.
 * - Checks if the email is already registered.
 * - Creates a new user record in the database.
 * - Generates and returns a JWT token along with the new user’s information.
 */
function handleRegister()
{
    $json_data = getJsonData();

    // Validate that both email and password are provided.
    if (!$json_data || !isset($json_data['email']) || !isset($json_data['password'])) {
        sendErrorResponse('Email and password are required', 400);
    }

    $email    = $json_data['email'];
    $password = $json_data['password'];
    $name     = $json_data['name'] ?? null;

    // Check if the provided email is already associated with an account.
    if (getUserByEmail($email)) {
        sendErrorResponse('Email already exists', 409);
    }

    // Create a new user record.
    $userId = createUser($email, $password, $name);

    if (!$userId) {
        sendErrorResponse('Registration failed', 500);
    }

    // Generate a JWT token for the new user.
    $token = generateJWT(['id' => $userId, 'email' => $email]);

    // Return the new user's data and token.
    sendSuccessResponse([
        'user' => [
            'id'    => $userId,
            'email' => $email,
            'name'  => $name
        ],
        'access_token' => $token
    ]);
}

/**
 * Handle profile retrieval.
 *
 * This function:
 * - Authenticates the request using a JWT token.
 * - Retrieves and returns the authenticated user's profile data.
 */
function handleProfile()
{
    // Verify that the request is authenticated.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Retrieve the user's data from the database.
    $userData = getUserById($user['id']);
    if (!$userData) {
        sendErrorResponse('User not found', 404);
    }

    // Respond with the user's profile data.
    sendSuccessResponse(['user' => $userData]);
}

/**
 * Handle password reset request.
 *
 * This function:
 * - Retrieves the email from the request.
 * - Generates a password reset token for the user (if the email exists).
 * - In a real application, an email would be sent with reset instructions.
 * - Always returns a success response for security purposes.
 */
function handlePasswordResetRequest()
{
    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['email'])) {
        sendErrorResponse('Email is required', 400);
    }

    $email = $json_data['email'];
    $user = getUserByEmail($email);

    // If user exists, generate a reset token and log it.
    if ($user) {
        $token = createPasswordResetToken($user['id']);
        // In production, send the reset token via email.
        error_log("Password reset token for {$email}: {$token}");
    }

    // Always return a success message to prevent email enumeration.
    sendSuccessResponse([
        'message' => 'If an account exists with that email, a reset link has been sent'
    ]);
}

/**
 * Handle password reset using a token.
 *
 * This function:
 * - Validates that both a reset token and new password are provided.
 * - Checks password strength (minimum 8 characters).
 * - Verifies the validity of the reset token.
 * - Updates the user's password in the database.
 * - Marks the reset token as used to prevent reuse.
 */
function handlePasswordReset()
{
    $json_data = getJsonData();

    if (!$json_data || !isset($json_data['token']) || !isset($json_data['password'])) {
        sendErrorResponse('Token and new password are required', 400);
    }

    $token    = $json_data['token'];
    $password = $json_data['password'];

    // Ensure the new password meets minimum length requirements.
    if (strlen($password) < 8) {
        sendErrorResponse('Password must be at least 8 characters', 400);
    }

    // Validate the reset token.
    $tokenData = getValidResetToken($token);
    if (!$tokenData) {
        sendErrorResponse('Invalid or expired token', 400);
    }

    $userId = $tokenData['user_id'];

    // Update the user's password in the database.
    if (!updateUserPassword($userId, $password)) {
        sendErrorResponse('Failed to update password', 500);
    }

    // Mark the reset token as used to prevent its reuse.
    markResetTokenUsed($token);

    sendSuccessResponse(['message' => 'Password has been reset successfully']);
}

/**
 * Handle password change for authenticated users.
 *
 * This function:
 * - Authenticates the user.
 * - Validates that the current password and new password are provided.
 * - Ensures the new password meets minimum requirements.
 * - Verifies the current password before updating.
 * - Updates the user's password in the database.
 */
function handlePasswordChange()
{
    // Authenticate the user.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    $json_data = getJsonData();
    if (
        !$json_data ||
        !isset($json_data['currentPassword']) ||
        !isset($json_data['newPassword'])
    ) {
        sendErrorResponse('Current password and new password are required', 400);
    }

    $currentPassword = $json_data['currentPassword'];
    $newPassword = $json_data['newPassword'];

    // Validate that the new password is strong enough.
    if (strlen($newPassword) < 8) {
        sendErrorResponse('New password must be at least 8 characters', 400);
    }

    // Retrieve the user's current data.
    $userData = getUserById($user['id']);

    // Verify the current password is correct.
    if (!password_verify($currentPassword, $userData['password_hash'])) {
        sendErrorResponse('Current password is incorrect', 400);
    }

    // Update the password in the database.
    if (!updateUserPassword($user['id'], $newPassword)) {
        sendErrorResponse('Failed to update password', 500);
    }

    sendSuccessResponse(['message' => 'Password updated successfully']);
}

/**
 * Handle profile picture upload.
 *
 * This function:
 * - Authenticates the user.
 * - Validates that an image file is provided and that it is of an allowed type and size.
 * - Generates a unique filename and moves the uploaded file.
 * - Optimizes the image (resizing and compressing) if necessary using the GD library.
 * - Updates the user's profile with the new image URL.
 */
function handleProfilePictureUpload()
{
    // Authenticate the user.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Check if an image file is provided.
    if (!isset($_FILES['profile_image'])) {
        sendErrorResponse('No image file provided', 400);
    }

    $file = $_FILES['profile_image'];

    // Validate the MIME type of the image.
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowed_types)) {
        sendErrorResponse('Only JPG, PNG, and GIF images are allowed', 400);
    }

    // Validate the file size (limit to 2MB).
    if ($file['size'] > 2 * 1024 * 1024) {
        sendErrorResponse('Image size should not exceed 2MB', 400);
    }

    // Generate a unique filename for the uploaded image.
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $user['id'] . '_' . time() . '.' . $ext;
    $upload_path = __DIR__ . '/../uploads/profile/';

    // Create the upload directory if it doesn't exist.
    if (!file_exists($upload_path)) {
        mkdir($upload_path, 0755, true);
    }

    $destination = $upload_path . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        sendErrorResponse('Failed to upload image', 500);
    }

    // --- Image Optimization using GD library ---
    // Define the maximum dimensions for the profile image.
    $maxWidth = 300;
    $maxHeight = 300;

    // Load the image based on its MIME type.
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

        // Calculate the scaling ratio if the image is larger than allowed dimensions.
        $ratio = min($maxWidth / $width, $maxHeight / $height);
        if ($ratio < 1) {
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            // Preserve transparency for PNG and GIF images.
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

            // Resample the original image into the resized canvas.
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

            // Save the optimized image back to the destination.
            switch ($file['type']) {
                case 'image/jpeg':
                    imagejpeg($resizedImage, $destination, 85); // Save at 85% quality.
                    break;
                case 'image/png':
                    imagepng($resizedImage, $destination, 6); // Compression level 6 (0-9 scale).
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

    // Get the backend base URL from environment or fallback to localhost.
    $backend_base_url = getenv('BACKEND_BASE_URL') ?: 'http://localhost:8000';
    // Generate the full URL for the uploaded profile image.
    $image_url = $backend_base_url . '/uploads/profile/' . $filename;
    
    // Update the user's profile record with the new profile image URL.
    if (!updateUserProfileImage($user['id'], $image_url)) {
        sendErrorResponse('Failed to update profile image in database', 500);
    }

    // Return a success response with the new image URL.
    sendSuccessResponse([
        'message' => 'Profile picture updated successfully',
        'image_url' => $image_url
    ]);
}

/**
 * Route authentication-related requests to the appropriate handler based on the URL path.
 *
 * This function removes the "auth/" prefix from the path and routes the request to:
 * - Login, registration, profile retrieval, password reset request, password reset, password change,
 *   or profile picture upload handlers.
 *
 * @param string $path The full request path.
 */
function routeAuthRequest($path)
{
    // Remove the "auth/" prefix to identify the specific action.
    $authPath = substr($path, 5);

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
