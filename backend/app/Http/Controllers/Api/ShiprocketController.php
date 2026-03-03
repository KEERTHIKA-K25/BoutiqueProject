<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Http;

class ShiprocketController extends Controller
{
    private $token;

    public function __construct()
    {
        // For actual implementation, this token would typically be fetched dynamically by logging in
        // via the Shiprocket API, or by loading it from .env
        $this->token = env('SHIPROCKET_TOKEN');
    }

    public function createShipment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = \App\Models\Order::with('user')->find($request->order_id);
        $user = $order->user;

        // Login to get Bearer Token
        $loginResponse = Http::post('https://apiv2.shiprocket.in/v1/external/auth/login', [
            'email' => env('SHIPROCKET_EMAIL'),
            'password' => env('SHIPROCKET_PASSWORD'),
        ]);

        if ($loginResponse->failed()) {
            \Illuminate\Support\Facades\Log::error('Shiprocket Auth Failed: ' . $loginResponse->body());
            return response()->json(['error' => 'Shiprocket Auth Failed'], 500);
        }

        $token = $loginResponse->json()['token'] ?? '';

        // Standardized Official Payload Requirement
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

        // Ensure HTTP uses the Bearer Token to hit the *adhoc* official endpoint
        $createResponse = Http::withToken($token)->post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', $orderData);

        if ($createResponse->failed()) {
            \Illuminate\Support\Facades\Log::error('Shiprocket Create Failed: ' . $createResponse->body());
            return response()->json(['error' => 'Shiprocket Create Failed', 'details' => $createResponse->json()], 500);
        }

        $shiprocketOrderId = $createResponse->json()['order_id'] ?? null;
        $shiprocketShipmentId = $createResponse->json()['shipment_id'] ?? null;

        $order->status = 'pending'; // Requires Admin AWB assignment
        $order->save();

        return response()->json([
            'message' => 'Shipment created successfully',
            'shiprocket_order_id' => $shiprocketOrderId,
            'shipment_id' => $shiprocketShipmentId
        ], 201);
    }

    public function getTrackingDetails($tracking_id)
    {
        $loginResponse = Http::post('https://apiv2.shiprocket.in/v1/external/auth/login', [
            'email' => env('SHIPROCKET_EMAIL'),
            'password' => env('SHIPROCKET_PASSWORD'),
        ]);

        if ($loginResponse->failed()) {
            return response()->json(['error' => 'Shiprocket Auth Failed'], 500);
        }

        $token = $loginResponse->json()['token'] ?? '';

        $trackingResponse = Http::withToken($token)->post('https://apiv2.shiprocket.in/v1/external/courier/track/awbs', [
            'awbs' => [$tracking_id]
        ]);

        $responseData = $trackingResponse->json();

        $activities = [];
        if (isset($responseData['tracking_data'][$tracking_id]['tracking_data']['shipment_track_activities'])) {
            $activities = $responseData['tracking_data'][$tracking_id]['tracking_data']['shipment_track_activities'];
        }

        return response()->json([
            'track_activities' => $activities
        ]);
    }
}
