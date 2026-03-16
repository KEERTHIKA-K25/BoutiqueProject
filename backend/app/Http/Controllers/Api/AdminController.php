<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\Product;

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

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,shipped,delivered'
        ]);
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();
        return response()->json($order);
    }

    public function storeProduct(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'image_url' => 'required|url',
        ]);

        $product = Product::create($validatedData);

        return response()->json($product, 201);
    }
}
