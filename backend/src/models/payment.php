<?php

/**
 * Payment model functions.
 */
require_once __DIR__ . '/../core/database.php';

/**
 * Record payment initiation.
 * @param int $userId User ID
 * @param string $paymentMethod Payment method (stripe/paypal)
 * @param float $amount Amount in USD
 * @param string $tierName Donation tier name
 * @param string $paymentId External payment ID
 * @return int|null ID of recorded payment or null on failure
 */
function recordPaymentInitiation($userId, $paymentMethod, $amount, $tierName, $paymentId)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    $stmt = $pdo->prepare("
        INSERT INTO payments 
        (user_id, payment_method, amount, status, tier_name, external_payment_id, created_at) 
        VALUES (?, ?, ?, 'initiated', ?, ?, NOW())
    ");

    try {
        $stmt->execute([$userId, $paymentMethod, $amount, $tierName, $paymentId]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Error recording payment: " . $e->getMessage());
        return null;
    }
}

/**
 * Update payment status.
 * @param string $externalPaymentId External payment ID
 * @param string $status New status
 * @return bool Success status
 */
function updatePaymentStatus($externalPaymentId, $status)
{
    $pdo = getDbConnection();
    if (!$pdo) return false;

    $stmt = $pdo->prepare("
        UPDATE payments 
        SET status = ?, updated_at = NOW() 
        WHERE external_payment_id = ?
    ");

    try {
        $stmt->execute([$status, $externalPaymentId]);
        return true;
    } catch (PDOException $e) {
        error_log("Error updating payment: " . $e->getMessage());
        return false;
    }
}

/**
 * Get payment by external ID.
 * @param string $externalPaymentId External payment ID
 * @return array|null Payment data or null if not found
 */
function getPaymentByExternalId($externalPaymentId)
{
    $pdo = getDbConnection();
    if (!$pdo) return null;

    $stmt = $pdo->prepare("
        SELECT * FROM payments 
        WHERE external_payment_id = ?
    ");

    $stmt->execute([$externalPaymentId]);

    if ($stmt->rowCount() === 0) {
        return null;
    }

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Get user payments history.
 * @param int $userId User ID
 * @param int $limit Max number of records
 * @return array Payments history
 */
function getUserPaymentsHistory($userId, $limit = 10)
{
    $pdo = getDbConnection();
    if (!$pdo) return [];

    $stmt = $pdo->prepare("
        SELECT * FROM payments 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ");

    try {
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error fetching payments: " . $e->getMessage());
        return [];
    }
}