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

    public function returnOrder(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $order = \App\Models\Order::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        $mockUserAddress = [
            'pickup_customer_name' => $request->user()->name,
            'pickup_address'       => '123, Kumaran Street, Sembanarkoil',
            'pickup_city'          => 'Mayiladuthurai',
            'pickup_state'         => 'Tamil Nadu',
            'pickup_country'       => 'India',
            'pickup_pincode'       => '609309',
            'pickup_phone'         => '9876543210',
        ];

        try {
            $response = $this->shiprocketService->createReturnShipment($order, $mockUserAddress, $request->reason);

            $returnOrder = \App\Models\ReturnOrder::create([
                'order_id' => $order->id,
                'shipment_id' => $response['shipment_id'] ?? 'Pending',
                'reason' => $request->reason,
                'status' => 'Pending'
            ]);

            $order->update([
                'status' => 'Return Requested'
            ]);

            return response()->json([
                'message' => 'Return requested successfully.',
                'shipment_id' => $returnOrder->shipment_id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to initiate return.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
