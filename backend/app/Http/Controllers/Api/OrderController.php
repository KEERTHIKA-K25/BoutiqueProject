<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\OrderService;
use App\Services\ShiprocketService;

class OrderController extends Controller
{
    public function __construct(private
        OrderService $orderService, private
        ShiprocketService $shiprocketService
        )
    {
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $order = $this->orderService->createPendingOrder(
            $request->user()->id,
            $request->product_id
        );

        try {
            // Trigger Shiprocket Integration Internally via Service Layer
            $shipmentData = $this->shiprocketService->createAdhocShipment($order);

            $order = $order->fresh();

            // Trigger Notification (Mock WhatsApp/SMS)
            $notificationService = new \App\Services\NotificationService();
            $notificationService->sendOrderNotification($order);

            return response()->json([
                'message' => 'Order placed successfully!',
                'shiprocket_order_id' => $shipmentData['shiprocket_order_id'] ?? null,
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
        $orders = $this->orderService->getUserOrders($request->user()->id);

        return response()->json($orders);
    }
}
