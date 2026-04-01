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
        $validatedData = $request->validate([
            'product_id'           => 'required|exists:products,id',
            'shipping_address'     => 'required|string|max:255',
            'shipping_city'        => 'required|string|max:100',
            'shipping_state'       => 'required|string|max:100',
            'shipping_pincode'     => 'required|digits:6',
            'selected_size'        => 'nullable|string|in:XS,S,M,L,XL,XXL,Custom',
            'custom_measurements'  => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Auto-fill name and phone from authenticated user — never from form
        $shippingName  = $user->name;
        $shippingPhone = $user->phone;

        $order = $this->orderService->createPendingOrder(
            $user->id,
            $validatedData['product_id'],
            [
                'shipping_name'       => $shippingName,
                'shipping_phone'      => $shippingPhone,
                'shipping_address'    => $validatedData['shipping_address'],
                'shipping_city'       => $validatedData['shipping_city'],
                'shipping_state'      => $validatedData['shipping_state'],
                'shipping_pincode'    => $validatedData['shipping_pincode'],
                'selected_size'       => $validatedData['selected_size'] ?? null,
                'custom_measurements' => $validatedData['custom_measurements'] ?? null,
            ]
        );

        // Save / update address in users table for future reuse
        $user->update([
            'address' => $validatedData['shipping_address'],
            'city'    => $validatedData['shipping_city'],
            'state'   => $validatedData['shipping_state'],
            'pincode' => $validatedData['shipping_pincode'],
        ]);

        try {
            $shipmentData = $this->shiprocketService->createAdhocShipment($order);

            $order = $order->fresh();

            $notificationService = new \App\Services\NotificationService();
            $notificationService->sendOrderNotification($order);

            return response()->json([
                'message'             => 'Order placed successfully!',
                'shiprocket_order_id' => $shipmentData['shiprocket_order_id'] ?? null,
                'order'               => $order
            ], 201);
        } catch (\Exception $e) {
            Log::error('Shiprocket Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Order saved but shipping failed to initialize.',
                'error'   => $e->getMessage(),
                'order'   => $order
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
