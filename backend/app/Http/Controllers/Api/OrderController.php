<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $product = Product::findOrFail($request->product_id);

        $order = Order::create([
            'user_id' => $request->user()->id,
            'total_amount' => $product->price,
            'status' => 'pending'
        ]);

        try {
            // Trigger Shiprocket Integration Internally
            $shiprocketController = new ShiprocketController();
            $shipmentRequest = new Request(['order_id' => $order->id]);
            $shipmentResponse = $shiprocketController->createShipment($shipmentRequest);

            $responseData = json_decode($shipmentResponse->getContent());

            // Notification service has been triggered later once Admin ships it 
            // but for mission requirements, let's keep simulating it.
            $order = $order->fresh();

            // Trigger Notification (Mock WhatsApp/SMS)
            $notificationService = new \App\Services\NotificationService();
            $notificationService->sendOrderNotification($order);

            return response()->json([
                'message' => 'Order placed successfully!',
                'shiprocket_order_id' => $responseData->shiprocket_order_id ?? null,
                'order' => $order
            ], 201);
        }
        catch (\Exception $e) {
            Log::error('Shiprocket Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Order saved but shipping failed to initialize.',
                'error' => $e->getMessage(),
                'order' => $order
            ], 500);
        }
    }

    public function userOrders(Request $request)
    {
        // Return orders for authenticated user
        $orders = Order::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }
}
