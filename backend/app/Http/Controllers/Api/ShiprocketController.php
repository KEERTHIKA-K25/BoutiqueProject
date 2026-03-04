<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ShiprocketService;
use App\Models\Order;

class ShiprocketController extends Controller
{
    public function __construct(private ShiprocketService $shiprocketService)
    {
    }

    public function createShipment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::with('user')->find($request->order_id);

        try {
            $responseData = $this->shiprocketService->createAdhocShipment($order);

            return response()->json([
                'message' => 'Shipment created successfully',
                'shiprocket_order_id' => $responseData['shiprocket_order_id'],
                'shipment_id' => $responseData['shipment_id']
            ], 201);
        }
        catch (\Exception $e) {
            return response()->json([
                'error' => 'Shiprocket Create Failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getTrackingDetails($tracking_id)
    {
        try {
            $activities = $this->shiprocketService->getTrackingActivities($tracking_id);

            return response()->json([
                'track_activities' => $activities
            ]);
        }
        catch (\Exception $e) {
            return response()->json(['error' => 'Shiprocket Auth Failed or Tracking Failed'], 500);
        }
    }
}
