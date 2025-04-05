<?php
/**
 * Payment Model Functions
 *
 * This file contains functions to handle payment-related operations in the database.
 * It includes functions to record new payments, update payment statuses, retrieve payment
 * details by external ID, and fetch a user's payment history.
 */

// Include the database connection helper.
require_once __DIR__ . '/../core/database.php';

/**
 * Record a new payment initiation in the database.
 *
 * This function creates a new payment record with an initial status of "initiated".
 * It uses the provided user ID, payment method (e.g., "stripe" or "paypal"), amount,
 * donation tier name, and an external payment ID to record the transaction.
 *
 * @param int    $userId        The ID of the user making the payment.
 * @param string $paymentMethod The payment method used (e.g., stripe, paypal).
 * @param float  $amount        The amount of the payment in USD.
 * @param string $tierName      The donation tier name.
 * @param string $paymentId     The external payment ID provided by the payment gateway.
 * @return int|null             The ID of the recorded payment or null on failure.
 */
function recordPaymentInitiation($userId, $paymentMethod, $amount, $tierName, $paymentId)
{
    // Establish a PDO connection to the database.
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Prepare the SQL statement to insert a new payment record.
    $stmt = $pdo->prepare("
        INSERT INTO payments 
        (user_id, payment_method, amount, status, tier_name, external_payment_id, created_at) 
        VALUES (?, ?, ?, 'initiated', ?, ?, NOW())
    ");

    try {
        // Execute the prepared statement with the provided parameters.
        $stmt->execute([$userId, $paymentMethod, $amount, $tierName, $paymentId]);
        // Return the ID of the newly inserted payment record.
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        // Log the error if the insertion fails and return null.
        error_log("Error recording payment: " . $e->getMessage());
        return null;
    }
}

/**
 * Update the status of an existing payment.
 *
 * This function updates the payment record identified by the external payment ID,
 * setting a new status and updating the 'updated_at' timestamp.
 *
 * @param string $externalPaymentId The external payment ID of the payment record.
 * @param string $status            The new status to set for the payment.
 * @return bool                     True on success, false on failure.
 */
function updatePaymentStatus($externalPaymentId, $status)
{
    // Establish a PDO connection.
    $pdo = getDbConnection();
    if (!$pdo) return false;

    // Prepare the SQL statement to update the payment status.
    $stmt = $pdo->prepare("
        UPDATE payments 
        SET status = ?, updated_at = NOW() 
        WHERE external_payment_id = ?
    ");

    try {
        // Execute the update with the new status and external payment ID.
        $stmt->execute([$status, $externalPaymentId]);
        return true;
    } catch (PDOException $e) {
        // Log the error if the update fails and return false.
        error_log("Error updating payment: " . $e->getMessage());
        return false;
    }
}

/**
 * Retrieve a payment record by its external payment ID.
 *
 * This function fetches a payment record from the database using the provided
 * external payment ID. If the payment record is not found, it returns null.
 *
 * @param string $externalPaymentId The external payment ID.
 * @return array|null               An associative array of payment data or null if not found.
 */
function getPaymentByExternalId($externalPaymentId)
{
    // Establish a PDO connection.
    $pdo = getDbConnection();
    if (!$pdo) return null;

    // Prepare the SQL statement to select a payment record by external payment ID.
    $stmt = $pdo->prepare("
        SELECT * FROM payments 
        WHERE external_payment_id = ?
    ");

    // Execute the statement with the provided external payment ID.
    $stmt->execute([$externalPaymentId]);

    // If no records are found, return null.
    if ($stmt->rowCount() === 0) {
        return null;
    }

    // Return the payment record as an associative array.
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Retrieve a user's payment history.
 *
 * This function fetches the most recent payment records for a given user.
 * It orders the payments by creation date in descending order and limits the result set.
 *
 * @param int $userId The ID of the user.
 * @param int $limit  The maximum number of payment records to return (default is 10).
 * @return array      An array of payment records, or an empty array if none found.
 */
function getUserPaymentsHistory($userId, $limit = 10)
{
    // Establish a PDO connection.
    $pdo = getDbConnection();
    if (!$pdo) return [];

    // Prepare the SQL statement to select payment records for the user.
    $stmt = $pdo->prepare("
        SELECT * FROM payments 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ");

    try {
        // Execute the statement with the user's ID and the specified limit.
        $stmt->execute([$userId, $limit]);
        // Fetch and return all payment records as an associative array.
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Log any errors and return an empty array if the query fails.
        error_log("Error fetching payments: " . $e->getMessage());
        return [];
    }
}
