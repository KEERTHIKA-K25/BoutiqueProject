<?php
namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShiprocketService
{
    private function authenticate(): string
    {
        $loginResponse = Http::post('https://apiv2.shiprocket.in/v1/external/auth/login', [
            'email' => env('SHIPROCKET_EMAIL'),
            'password' => env('SHIPROCKET_PASSWORD'),
        ]);

        if ($loginResponse->failed()) {
            Log::error('Shiprocket Auth Failed: ' . $loginResponse->body());
            throw new \Exception('Shiprocket Auth Failed');
        }

        return $loginResponse->json()['token'] ?? '';
    }

    public function createAdhocShipment(Order $order): array
    {
        $order->loadMissing('user');
        $user = $order->user;

        $token = $this->authenticate();

        $orderData = [
            'order_id' => 'ORD-' . $order->id . '-' . time(),
            'order_date' => now()->format('Y-m-d H:i'),
            'pickup_location' => 'home',
            'billing_customer_name' => $user->name,
            'billing_last_name' => 'Boutique', // Mandatory
            'billing_address' => '123 Boutique St',
            'billing_city' => 'New Delhi',
            'billing_pincode' => '110001',
            'billing_state' => 'Delhi',
            'billing_country' => 'India',
            'billing_email' => $user->email,
            'billing_phone' => $user->phone ?? '9876543210',
            'shipping_is_billing' => true,
            'order_items' => [
                [
                    'name' => 'Boutique Premium Item',
                    'sku' => 'SKU-' . rand(100, 999),
                    'units' => 1,
                    'selling_price' => $order->total_amount,
                ]
            ],
            'payment_method' => 'Prepaid',
            'sub_total' => $order->total_amount,
            'length' => 10,
            'breadth' => 15,
            'height' => 20,
            'weight' => 0.5
        ];

        $createResponse = Http::withToken($token)->post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', $orderData);

        if ($createResponse->failed()) {
            Log::error('Shiprocket Create Failed: ' . $createResponse->body());
            throw new \Exception('Shiprocket Create Failed');
        }

        $shiprocketOrderId = $createResponse->json()['order_id'] ?? null;
        $shiprocketShipmentId = $createResponse->json()['shipment_id'] ?? null;

        $order->status = 'pending'; // Requires Admin AWB assignment
        $order->save();

        return [
            'shiprocket_order_id' => $shiprocketOrderId,
            'shipment_id' => $shiprocketShipmentId
        ];
    }

    public function getTrackingActivities(string $trackingId): array
    {
        $token = $this->authenticate();

        $trackingResponse = Http::withToken($token)->post('https://apiv2.shiprocket.in/v1/external/courier/track/awbs', [
            'awbs' => [$trackingId]
        ]);

        $responseData = $trackingResponse->json();

        $activities = [];
        if (isset($responseData['tracking_data'][$trackingId]['tracking_data']['shipment_track_activities'])) {
            $activities = $responseData['tracking_data'][$trackingId]['tracking_data']['shipment_track_activities'];
        }

        return $activities;
    }
}
