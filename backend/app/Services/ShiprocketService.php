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
            'order_id'               => 'ORD-' . $order->id . '-' . time(),
            'order_date'             => now()->format('Y-m-d H:i'),
            'pickup_location'        => 'home',
            'billing_customer_name'  => $order->shipping_name,
            'billing_last_name'      => '',
            'billing_address'        => $order->shipping_address,
            'billing_city'           => $order->shipping_city,
            'billing_pincode'        => $order->shipping_pincode,
            'billing_state'          => $order->shipping_state,
            'billing_country'        => 'India',
            'billing_email'          => $user->email,
            'billing_phone'          => $order->shipping_phone,
            'shipping_is_billing'    => true,
            'order_items'            => [
                [
                    'name'          => 'Boutique Premium Item',
                    'sku'           => 'SKU-' . rand(100, 999),
                    'units'         => 1,
                    'selling_price' => $order->total_amount,
                ]
            ],
            'payment_method' => 'Prepaid',
            'sub_total'      => $order->total_amount,
            'length'         => 10,
            'breadth'        => 15,
            'height'         => 20,
            'weight'         => 0.5
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

    public function createReturnShipment(Order $order, array $pickupAddress, string $reason): array
    {
        $token = $this->authenticate();

        $returnPayload = [
            'order_id' => 'return_' . time() . '_' . $order->id,
            'order_date' => now()->format('Y-m-d H:i'),
            'channel_id' => '',
            'pickup_customer_name' => $pickupAddress['pickup_customer_name'],
            'pickup_last_name' => '',
            'pickup_address' => $pickupAddress['pickup_address'],
            'pickup_address_2' => '',
            'pickup_city' => $pickupAddress['pickup_city'],
            'pickup_state' => $pickupAddress['pickup_state'],
            'pickup_country' => $pickupAddress['pickup_country'],
            'pickup_pincode' => $pickupAddress['pickup_pincode'],
            'pickup_email' => $order->user->email ?? 'noreply@return.com',
            'pickup_phone' => $pickupAddress['pickup_phone'],
            'shipping_customer_name' => 'Boutique Returns',
            'shipping_last_name' => '',
            'shipping_address' => '123 Boutique Main St',
            'shipping_address_2' => '',
            'shipping_city' => 'New Delhi',
            'shipping_country' => 'India',
            'shipping_pincode' => '110001',
            'shipping_state' => 'Delhi',
            'shipping_email' => 'returns@boutique.com',
            'shipping_phone' => '9876543210',
            'order_items' => [
                [
                    'name' => 'Return: Boutique Item',
                    'sku' => 'RET-SKU-' . $order->product_id,
                    'units' => 1,
                    'selling_price' => $order->total_amount,
                ]
            ],
            'payment_method' => 'Prepaid',
            'total_discount' => '0',
            'sub_total' => $order->total_amount,
            'length' => 10,
            'breadth' => 15,
            'height' => 20,
            'weight' => 0.5,
            'qc_enable' => true,
            'qc_reason' => $reason
        ];

        $createResponse = Http::withToken($token)->post('https://apiv2.shiprocket.in/v1/external/orders/create/return', $returnPayload);

        if ($createResponse->failed()) {
            Log::error('Shiprocket Return Create Failed: ' . $createResponse->body());
            throw new \Exception('Shiprocket Return Create Failed');
        }

        return $createResponse->json();
    }
}
