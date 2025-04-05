<?php
/**
 * Payment Controller
 *
 * This file handles payment creation for both Stripe and PayPal.
 * It includes mock implementations for development environments if the real SDKs are not installed.
 * It also routes incoming payment requests to the appropriate handler based on the URL path.
 */

// Include core dependencies: database connection, JWT authentication, and response formatting.
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';

// Include the Payment model for database operations.
require_once __DIR__ . '/../models/payment.php';


/**
 * --- MOCK IMPLEMENTATIONS FOR DEVELOPMENT ---
 * The following mock implementations are used when the real SDK classes for Stripe or PayPal are not available.
 */

/**
 * Mock implementation for Stripe Checkout Session.
 * This will only be used in development if the real Stripe SDK is not installed.
 */
if (!class_exists('\\Stripe\\Stripe')) {
    class StripeCheckoutSession {
        public $id;
        public $url;

        /**
         * Create a mock Stripe Checkout session.
         *
         * @param array $options Options for creating a checkout session (ignored in mock)
         * @return StripeCheckoutSession The mock session object with generated ID and URL.
         */
        public static function create($options) {
            $session = new StripeCheckoutSession();
            // Generate a unique session id for testing purposes.
            $session->id = 'test_session_' . uniqid();
            // Generate a fake URL for the checkout page.
            $session->url = 'https://checkout.stripe.test/pay/' . $session->id;
            return $session;
        }
    }

    error_log("Using Stripe mock implementation. Install Stripe SDK in production.");
}

/**
 * Mock implementation for PayPal.
 * These classes mimic the basic structure of the real PayPal SDK and are used during development.
 */
if (!class_exists('\\PayPal\\Rest\\ApiContext')) {
    class MockPayPalApiContext {
        public function __construct($credentials) {}
    }

    class MockPayPalCredential {
        public function __construct($clientId, $clientSecret) {}
    }

    class MockPayPalPayer {
        /**
         * Set the payment method.
         *
         * @param string $method Payment method (e.g., "paypal")
         * @return $this
         */
        public function setPaymentMethod($method) { return $this; }
    }

    class MockPayPalAmount {
        /**
         * Set the total amount for the payment.
         *
         * @param mixed $amount Total amount.
         * @return $this
         */
        public function setTotal($amount) { return $this; }
        /**
         * Set the currency for the payment.
         *
         * @param string $currency Currency code (e.g., "USD")
         * @return $this
         */
        public function setCurrency($currency) { return $this; }
    }

    class MockPayPalTransaction {
        /**
         * Set the amount for this transaction.
         *
         * @param MockPayPalAmount $amount
         * @return $this
         */
        public function setAmount($amount) { return $this; }
        /**
         * Set a description for this transaction.
         *
         * @param string $desc
         * @return $this
         */
        public function setDescription($desc) { return $this; }
    }

    class MockPayPalRedirectUrls {
        /**
         * Set the return URL for a successful payment.
         *
         * @param string $url
         * @return $this
         */
        public function setReturnUrl($url) { return $this; }
        /**
         * Set the cancel URL for a canceled payment.
         *
         * @param string $url
         * @return $this
         */
        public function setCancelUrl($url) { return $this; }
    }

    class MockPayPalPayment {
        public $id;
        private $links = [];

        /**
         * Constructor creates a mock payment with a unique ID and a default approval URL.
         */
        public function __construct() {
            $this->id = 'test_payment_' . uniqid();
            // Simulate approval URL link for the payment.
            $this->links[] = (object)['rel' => 'approval_url', 'href' => 'https://paypal.test/approve/' . $this->id];
        }

        /**
         * Set the intent for the payment.
         *
         * @param string $intent
         * @return $this
         */
        public function setIntent($intent) { return $this; }
        /**
         * Set the payer for the payment.
         *
         * @param object $payer
         * @return $this
         */
        public function setPayer($payer) { return $this; }
        /**
         * Set the transactions array.
         *
         * @param array $transactions
         * @return $this
         */
        public function setTransactions($transactions) { return $this; }
        /**
         * Set the redirect URLs.
         *
         * @param object $urls
         * @return $this
         */
        public function setRedirectUrls($urls) { return $this; }
        /**
         * Create the payment using the given context.
         *
         * @param mixed $context
         * @return $this
         */
        public function create($context) { return $this; }
        /**
         * Retrieve the links associated with this payment.
         *
         * @return array List of link objects.
         */
        public function getLinks() { return $this->links; }
        /**
         * Retrieve the payment ID.
         *
         * @return string Payment ID.
         */
        public function getId() { return $this->id; }
    }

    error_log("Using PayPal mock implementation. Install PayPal SDK in production.");
}


/**
 * Handle Stripe Checkout creation request.
 *
 * This function authenticates the user, validates input data, configures the payment parameters,
 * and then creates a Stripe checkout session (or uses a mock if the SDK is missing).
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

    // Determine the base URLs for backend and frontend using environment variables.
    $backend_base_url = getenv('BACKEND_BASE_URL') ?: 'http://localhost:8000';
    $frontend_url = getenv('FRONTEND_URL') ?: (
        $backend_base_url === 'https://chimerastack.com' ?
        'https://chimerastack.com' :
        'http://localhost:3000'
    );
    // URLs for redirection after payment success or cancellation.
    $success_url = $frontend_url . '/support?success=true&session_id={CHECKOUT_SESSION_ID}';
    $cancel_url = $frontend_url . '/support?canceled=true';

    // Get Stripe API key from environment or fallback to test key.
    $stripeApiKey = getenv('STRIPE_SECRET_KEY') ?: 'sk_test_yourTestKey';

    try {
        // If the real Stripe SDK is available, create a real checkout session.
        if (class_exists('\\Stripe\\Stripe')) {
            \Stripe\Stripe::setApiKey($stripeApiKey);
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => "ChimeraStack Donation - $tierName",
                        ],
                        // Convert the amount to cents as Stripe expects amounts in the smallest currency unit.
                        'unit_amount' => $amount * 100,
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
        } else {
            // Fallback to mock Stripe implementation if the SDK is not installed.
            $session = StripeCheckoutSession::create([]);
        }

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
        sendErrorResponse('Payment processing failed: ' . $e->getMessage(), 500);
    }
}


/**
 * Handle PayPal payment creation request.
 *
 * This function authenticates the user, validates input data, and creates a PayPal payment session.
 * It uses either the real PayPal SDK or a mock implementation for development purposes.
 */
function handlePaypalPaymentCreate()
{
    // Authenticate the user.
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

    // Retrieve JSON payload and validate required fields.
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

    // Determine backend and frontend URLs using environment variables.
    $backend_base_url = getenv('BACKEND_BASE_URL') ?: 'http://localhost:8000';
    $frontend_url = getenv('FRONTEND_URL') ?: (
        $backend_base_url === 'https://chimerastack.com' ?
        'https://chimerastack.com' :
        'http://localhost:3000'
    );
    // Set success and cancellation URLs for PayPal redirection.
    $success_url = $frontend_url . '/support?success=true';
    $cancel_url = $frontend_url . '/support?canceled=true';

    try {
        // Check if the real PayPal SDK is available.
        if (class_exists('\\PayPal\\Rest\\ApiContext')) {
            // Create real PayPal API context with OAuth credentials.
            $apiContext = new \PayPal\Rest\ApiContext(
                new \PayPal\Auth\OAuthTokenCredential(
                    getenv('PAYPAL_CLIENT_ID') ?: 'your_client_id',
                    getenv('PAYPAL_CLIENT_SECRET') ?: 'your_client_secret'
                )
            );

            // Initialize real PayPal SDK classes.
            $payer = new \PayPal\Api\Payer();
            $amount_obj = new \PayPal\Api\Amount();
            $transaction = new \PayPal\Api\Transaction();
            $redirectUrls = new \PayPal\Api\RedirectUrls();
            $payment = new \PayPal\Api\Payment();
        } else {
            // Fallback to mock PayPal implementation if the SDK is not installed.
            $apiContext = new MockPayPalApiContext(
                new MockPayPalCredential(
                    getenv('PAYPAL_CLIENT_ID') ?: 'your_client_id',
                    getenv('PAYPAL_CLIENT_SECRET') ?: 'your_client_secret'
                )
            );

            $payer = new MockPayPalPayer();
            $amount_obj = new MockPayPalAmount();
            $transaction = new MockPayPalTransaction();
            $redirectUrls = new MockPayPalRedirectUrls();
            $payment = new MockPayPalPayment();
        }

        // Configure the payment details for PayPal.
        $payer->setPaymentMethod('paypal');
        $amount_obj->setTotal($amount)->setCurrency('USD');
        $transaction->setAmount($amount_obj)
                    ->setDescription("ChimeraStack Donation - $tierName");
        $redirectUrls->setReturnUrl($success_url)
                     ->setCancelUrl($cancel_url);

        // Build the payment object with intent, payer, transactions, and redirect URLs.
        $payment->setIntent('sale')
                ->setPayer($payer)
                ->setTransactions([$transaction])
                ->setRedirectUrls($redirectUrls);

        // Create the payment session.
        $payment->create($apiContext);

        // Extract the approval URL from the payment links.
        $approvalUrl = null;
        foreach ($payment->getLinks() as $link) {
            // Check for the link with relation 'approval_url'
            if ($link->getRel() == 'approval_url') {
                $approvalUrl = $link->getHref();
                break;
            }
        }

        // If no approval URL is found, throw an exception.
        if (!$approvalUrl) {
            throw new \Exception('Approval URL not found');
        }

        // Record the payment initiation in the database.
        $paymentId = recordPaymentInitiation($user['id'], 'paypal', $amount, $tierName, $payment->getId());

        // Send a successful response with the approval URL and payment ID.
        sendSuccessResponse([
            'approvalUrl' => $approvalUrl,
            'paymentId'   => $payment->getId(),
        ]);
    } catch (\Exception $e) {
        // Log any errors encountered and return an error response.
        error_log("PayPal error: " . $e->getMessage());
        sendErrorResponse('Payment processing failed: ' . $e->getMessage(), 500);
    }
}


/**
 * Route incoming payment requests to the appropriate handler.
 *
 * This function checks the request path and calls the corresponding function for:
 * - Creating a Stripe checkout session
 * - Creating a PayPal payment
 * - Verifying payment status (dummy implementations)
 *
 * @param string $path The endpoint path from the request.
 */
function routePaymentRequest($path)
{
    if ($path === 'payment/stripe/create-checkout') {
        handleStripeCheckoutCreate();
    } elseif ($path === 'payment/paypal/create-payment') {
        handlePaypalPaymentCreate();
    } elseif ($path === 'payment/stripe/verify') {
        // Placeholder for Stripe payment verification logic.
        sendSuccessResponse(['message' => 'Payment verified']);
    } elseif ($path === 'payment/paypal/verify') {
        // Placeholder for PayPal payment verification logic.
        sendSuccessResponse(['message' => 'Payment verified']);
    } else {
        // If the endpoint is not recognized, return a 404 error.
        sendErrorResponse('Payment endpoint not found', 404);
    }
}
