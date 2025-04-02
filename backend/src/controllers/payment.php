<?php

/**
 * Payment controller.
 */
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/jwt.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../models/payment.php';


/**
 * Mock Stripe implementation for development
 */
if (!class_exists('\\Stripe\\Stripe')) {
    class StripeCheckoutSession {
        public $id;
        public $url;

        public static function create($options) {
            $session = new StripeCheckoutSession();
            $session->id = 'test_session_' . uniqid();
            $session->url = 'https://checkout.stripe.test/pay/' . $session->id;
            return $session;
        }
    }

    error_log("Using Stripe mock implementation. Install Stripe SDK in production.");
}

/**
 * Mock PayPal implementation for development
 */
if (!class_exists('\\PayPal\\Rest\\ApiContext')) {
    class MockPayPalApiContext {
        public function __construct($credentials) {}
    }

    class MockPayPalCredential {
        public function __construct($clientId, $clientSecret) {}
    }

    class MockPayPalPayer {
        public function setPaymentMethod($method) { return $this; }
    }

    class MockPayPalAmount {
        public function setTotal($amount) { return $this; }
        public function setCurrency($currency) { return $this; }
    }

    class MockPayPalTransaction {
        public function setAmount($amount) { return $this; }
        public function setDescription($desc) { return $this; }
    }

    class MockPayPalRedirectUrls {
        public function setReturnUrl($url) { return $this; }
        public function setCancelUrl($url) { return $this; }
    }

    class MockPayPalPayment {
        public $id;
        private $links = [];

        public function __construct() {
            $this->id = 'test_payment_' . uniqid();
            $this->links[] = (object)['rel' => 'approval_url', 'href' => 'https://paypal.test/approve/' . $this->id];
        }

        public function setIntent($intent) { return $this; }
        public function setPayer($payer) { return $this; }
        public function setTransactions($transactions) { return $this; }
        public function setRedirectUrls($urls) { return $this; }
        public function create($context) { return $this; }
        public function getLinks() { return $this->links; }
        public function getId() { return $this->id; }
    }

    error_log("Using PayPal mock implementation. Install PayPal SDK in production.");
}

/**
 * Handle Stripe checkout creation.
 */
function handleStripeCheckoutCreate()
{
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

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

    // Determine URLs from environment
    $backend_base_url = getenv('BACKEND_BASE_URL') ?: 'http://localhost:8000';
    $frontend_url = getenv('FRONTEND_URL') ?: (
        $backend_base_url === 'https://chimerastack.com' ? 
        'https://chimerastack.com' : 
        'http://localhost:3000'
    );
    $success_url = $frontend_url . '/support?success=true&session_id={CHECKOUT_SESSION_ID}';
    $cancel_url = $frontend_url . '/support?canceled=true';

    // Initialize Stripe using environment variable for the secret key
    $stripeApiKey = getenv('STRIPE_SECRET_KEY') ?: 'sk_test_yourTestKey';

    try {
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
                        'unit_amount' => $amount * 100, // Stripe uses cents
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
            // Use mock implementation for development
            $session = StripeCheckoutSession::create([]);
        }

        // Record payment initiation in the database
        $paymentId = recordPaymentInitiation($user['id'], 'stripe', $amount, $tierName, $session->id);

        sendSuccessResponse([
            'checkoutUrl' => $session->url,
            'sessionId'   => $session->id,
        ]);
    } catch (\Exception $e) {
        error_log("Stripe error: " . $e->getMessage());
        sendErrorResponse('Payment processing failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PayPal payment creation.
 */
function handlePaypalPaymentCreate()
{
    $user = authenticateRequest();
    if (!$user) {
        sendErrorResponse('Authentication required', 401);
    }

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

    // Determine URLs from environment
    $backend_base_url = getenv('BACKEND_BASE_URL') ?: 'http://localhost:8000';
    $frontend_url = getenv('FRONTEND_URL') ?: (
        $backend_base_url === 'https://chimerastack.com' ? 
        'https://chimerastack.com' : 
        'http://localhost:3000'
    );
    $success_url = $frontend_url . '/support?success=true';
    $cancel_url = $frontend_url . '/support?canceled=true';

    try {
        if (class_exists('\\PayPal\\Rest\\ApiContext')) {
            // Use real PayPal SDK
            $apiContext = new \PayPal\Rest\ApiContext(
                new \PayPal\Auth\OAuthTokenCredential(
                    getenv('PAYPAL_CLIENT_ID') ?: 'your_client_id',
                    getenv('PAYPAL_CLIENT_SECRET') ?: 'your_client_secret'
                )
            );

            $payer = new \PayPal\Api\Payer();
            $amount_obj = new \PayPal\Api\Amount();
            $transaction = new \PayPal\Api\Transaction();
            $redirectUrls = new \PayPal\Api\RedirectUrls();
            $payment = new \PayPal\Api\Payment();
        } else {
            // Use mock implementation for development
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

        // Configure the PayPal payment
        $payer->setPaymentMethod('paypal');
        $amount_obj->setTotal($amount)->setCurrency('USD');
        $transaction->setAmount($amount_obj)->setDescription("ChimeraStack Donation - $tierName");
        $redirectUrls->setReturnUrl($success_url)->setCancelUrl($cancel_url);

        $payment->setIntent('sale')
                ->setPayer($payer)
                ->setTransactions([$transaction])
                ->setRedirectUrls($redirectUrls);

        $payment->create($apiContext);

        // Retrieve the approval URL
        $approvalUrl = null;
        foreach ($payment->getLinks() as $link) {
            if ($link->getRel() == 'approval_url') {
                $approvalUrl = $link->getHref();
                break;
            }
        }

        if (!$approvalUrl) {
            throw new \Exception('Approval URL not found');
        }

        // Record payment initiation in the database
        $paymentId = recordPaymentInitiation($user['id'], 'paypal', $amount, $tierName, $payment->getId());

        sendSuccessResponse([
            'approvalUrl' => $approvalUrl,
            'paymentId'   => $payment->getId(),
        ]);
    } catch (\Exception $e) {
        error_log("PayPal error: " . $e->getMessage());
        sendErrorResponse('Payment processing failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Route payment requests to appropriate handlers.
 * @param string $path Request path
 */
function routePaymentRequest($path)
{
    if ($path === 'payment/stripe/create-checkout') {
        handleStripeCheckoutCreate();
    } elseif ($path === 'payment/paypal/create-payment') {
        handlePaypalPaymentCreate();
    } elseif ($path === 'payment/stripe/verify') {
        // Implementation for Stripe payment verification
        sendSuccessResponse(['message' => 'Payment verified']);
    } elseif ($path === 'payment/paypal/verify') {
        // Implementation for PayPal payment verification
        sendSuccessResponse(['message' => 'Payment verified']);
    } else {
        sendErrorResponse('Payment endpoint not found', 404);
    }
}
