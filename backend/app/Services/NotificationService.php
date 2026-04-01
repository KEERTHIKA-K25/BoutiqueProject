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
        // Use real shipping phone from order; fallback to user phone if not set
        $userPhone = $order->shipping_phone
            ?? ($order->user->phone ?? 'Unknown');

        $message = "Your Luxe & Lace order #{$order->id} has been placed successfully! "
                 . "We will notify you once your order is dispatched. "
                 . "Track here: {$order->tracking_id}";

        // Ready for live SMS/WhatsApp gateway — swap Log::info for API call
        Log::info("[SMS/WhatsApp] To: [{$userPhone}] Message: {$message}");
    }
}
