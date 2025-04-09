<?php

/**
 * Payment Controller
 *
 * This file handles payment creation for Stripe.
 * It includes improved error handling, better URL management, and
 * proper logging for debugging payment issues.
 */

// Include core dependencies: database connection, JWT authentication, and response formatting.
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';

// Include the Payment model for database operations.
require_once __DIR__ . '/../models/payment.php';

/**
 * Handle Stripe Checkout creation request.
 *
 * This function authenticates the user, validates input data, configures the payment parameters,
 * and then creates a Stripe checkout session using the Stripe PHP SDK.
 */
function handleStripeCheckoutCreate()
{
    // Authenticate the user making the request.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Retrieve and validate JSON payload from the request.
    $json_data = getJsonData();
    if (
        !$json_data ||
        !isset($json_data['amount']) ||
        !isset($json_data['tierName'])
    ) {
        sendErrorResponse('Amount and tier name are required', 400);
    }

    $amount   = $json_data['amount'];
    $tierName = $json_data['tierName'];

    // Validate the amount (must be a positive number)
    if (!is_numeric($amount) || $amount <= 0) {
        sendErrorResponse('Invalid amount: must be a positive number', 400);
    }

    // Determine the base URLs for backend and frontend using environment variables.
    $backend_base_url = getenv('BACKEND_BASE_URL') ?: 'http://localhost:8000';
    $frontend_url = getenv('FRONTEND_URL') ?: (
        $backend_base_url === 'https://chimerastack.com' ?
        'https://chimerastack.com' :
        'http://localhost:3000'
    );

    // Set payment success URL - use either env variable or construct from frontend URL
    $success_url = getenv('PAYMENT_SUCCESS_URL') ?:
        $frontend_url . '/support?success=true&session_id={CHECKOUT_SESSION_ID}';

    // Set payment cancel URL - use either env variable or construct from frontend URL              
    $cancel_url = getenv('PAYMENT_CANCEL_URL') ?:
        $frontend_url . '/support?canceled=true';

    // Get Stripe API key from environment or fallback to test key.
    $stripeApiKey = getenv('STRIPE_SECRET_KEY');

    if (!$stripeApiKey) {
        error_log("ERROR: STRIPE_SECRET_KEY environment variable is not set!");
        sendErrorResponse('Payment system configuration error', 500);
    }

    try {
        // Check if Stripe library is available
        if (!class_exists('\\Stripe\\Stripe')) {
            // Log detailed error for diagnostics
            error_log("ERROR: Stripe PHP SDK not available. Please run 'composer require stripe/stripe-php'");
            sendErrorResponse('Payment system is temporarily unavailable', 500);
        }

        // Log the checkout attempt to help with debugging
        error_log("Creating Stripe checkout session for user {$user['id']}, amount: \${$amount}, tier: {$tierName}");

        // Configure Stripe API key
        \Stripe\Stripe::setApiKey($stripeApiKey);

        // Create Stripe checkout session
        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => "ChimeraStack Donation - $tierName",
                    ],
                    // Convert the amount to cents as Stripe expects amounts in the smallest currency unit.
                    'unit_amount' => (int)($amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $success_url,
            'cancel_url' => $cancel_url,
            'customer_email' => $user['email'],
            'metadata' => [
                'user_id' => $user['id'],
                'tier_name' => $tierName
            ]
        ]);

        // Log successful session creation
        error_log("Stripe session created successfully: {$session->id}");

        // Record the initiation of the payment in the database.
        $paymentId = recordPaymentInitiation($user['id'], 'stripe', $amount, $tierName, $session->id);

        // Send a successful response with the checkout URL and session ID.
        sendSuccessResponse([
            'checkoutUrl' => $session->url,
            'sessionId'   => $session->id,
        ]);
    } catch (\Exception $e) {
        // Log the error for debugging and send an error response.
        error_log("Stripe error: " . $e->getMessage());

        // Determine if this is a Stripe-specific error
        $errorMessage = 'Payment processing failed';
        if (strpos(get_class($e), 'Stripe') !== false) {
            // Extract more helpful error message for Stripe errors
            $errorMessage .= ': ' . $e->getMessage();
        }

        sendErrorResponse($errorMessage, 500);
    }
}

/**
 * Handle Stripe payment verification.
 * 
 * This function verifies a Stripe session after the customer returns from the checkout process.
 * It updates the payment status in the database based on the session status.
 */
function handleStripePaymentVerify()
{
    // Authenticate the user.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Get the JSON data from the request.
    $json_data = getJsonData();
    if (!$json_data || !isset($json_data['sessionId'])) {
        sendErrorResponse('Session ID is required', 400);
    }

    $sessionId = $json_data['sessionId'];
    $stripeApiKey = getenv('STRIPE_SECRET_KEY');

    if (!$stripeApiKey) {
        error_log("ERROR: STRIPE_SECRET_KEY environment variable is not set!");
        sendErrorResponse('Payment system configuration error', 500);
    }

    try {
        // Check if Stripe library is available
        if (!class_exists('\\Stripe\\Stripe')) {
            error_log("ERROR: Stripe PHP SDK not available. Please run 'composer require stripe/stripe-php'");
            sendErrorResponse('Payment system is temporarily unavailable', 500);
        }

        // Configure Stripe API key
        \Stripe\Stripe::setApiKey($stripeApiKey);

        // Retrieve the session from Stripe
        $session = \Stripe\Checkout\Session::retrieve($sessionId);

        // Get the payment status from the session
        $paymentStatus = $session->payment_status;

        // Get the payment from our database
        $payment = getPaymentByExternalId($sessionId);

        if (!$payment) {
            sendErrorResponse('Payment record not found', 404);
        }

        // Map Stripe's payment status to our internal status
        $status = '';
        switch ($paymentStatus) {
            case 'paid':
                $status = 'completed';
                break;
            case 'unpaid':
                $status = 'pending';
                break;
            default:
                $status = 'failed';
        }

        // Update the payment status in our database
        updatePaymentStatus($sessionId, $status);

        // Return the payment verification result
        sendSuccessResponse([
            'status' => $status,
            'payment_id' => $payment['id']
        ]);
    } catch (\Exception $e) {
        error_log("Stripe verification error: " . $e->getMessage());
        sendErrorResponse('Payment verification failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Get payment history for the current user.
 * 
 * This function retrieves the payment history for the authenticated user.
 */
function handlePaymentHistory()
{
    // Authenticate the user.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    try {
        // Get the user's payment history from the database
        $payments = getUserPaymentsHistory($user['id']);

        // Send a successful response with the payment history
        sendSuccessResponse([
            'payments' => $payments
        ]);
    } catch (\Exception $e) {
        error_log("Error fetching payment history: " . $e->getMessage());
        sendErrorResponse('Failed to retrieve payment history', 500);
    }
}

/**
 * Route incoming payment requests to the appropriate handler.
 *
 * This function checks the request path and calls the corresponding function for:
 * - Creating a Stripe checkout session
 * - Verifying Stripe payment status
 * - Retrieving payment history
 *
 * @param string $path The endpoint path from the request.
 */
function routePaymentRequest($path)
{
    if ($path === 'payment/stripe/create-checkout') {
        handleStripeCheckoutCreate();
    } elseif ($path === 'payment/stripe/verify') {
        handleStripePaymentVerify();
    } elseif ($path === 'payment/history') {
        handlePaymentHistory();
    } else {
        // If the endpoint is not recognized, return a 404 error.
        sendErrorResponse('Payment endpoint not found', 404);
    }
}
