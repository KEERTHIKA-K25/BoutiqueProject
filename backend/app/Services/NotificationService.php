<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Order;

class NotificationService
{
    /**
     * Simulates sending an SMS or WhatsApp notification.
     */
    public function sendOrderNotification(Order $order): void
    {
        // For simulation purposes, we assume the user has a phone number. 
        // We will default to a placeholder if it doesn't exist on the User model.
        // E.g., if you added a phone column later: $userPhone = $order->user->phone ?? '+91-9876543210';
        $userPhone = '+91-9876543210';

        $message = "Your Boutique order #{$order->id} has been shipped! Track here: {$order->tracking_id}";

        // Log the message to simulate sending an SMS/WhatsApp integration
        Log::info("To: [{$userPhone}], Message: {$message}");
    }
}
