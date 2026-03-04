<?php
namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class OrderService
{
    public function createPendingOrder(int $userId, int $productId): Order
    {
        $product = Product::findOrFail($productId);

        return Order::create([
            'user_id' => $userId,
            'total_amount' => $product->price,
            'status' => 'pending'
        ]);
    }

    public function getUserOrders(int $userId): Collection
    {
        return Order::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
