<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    public function updateAwb(Request $request, $id)
    {
        $request->validate([
            'awb_code' => 'required|string'
        ]);
        $order = Order::findOrFail($id);
        $order->awb_code = $request->awb_code;
        $order->status = 'shipped';
        $order->save();
        return response()->json(['message' => 'AWB updated successfully', 'order' => $order]);
    }
}
