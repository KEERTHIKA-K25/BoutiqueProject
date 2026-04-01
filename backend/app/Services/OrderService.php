<?php
namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class OrderService
{
    public function createPendingOrder(int $userId, int $productId, array $addressData = []): Order
    {
        $product = Product::findOrFail($productId);

        return Order::create(array_merge([
            'user_id'      => $userId,
            'product_id'   => $productId,
            'total_amount' => $product->price,
            'status'       => 'pending'
        ], $addressData));
    }

    public function getUserOrders(int $userId): Collection
    {
        return Order::with(['returnOrder', 'product'])->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()->map(function ($order) {
                if ($order->returnOrder) {
                    $order->shipment_id = $order->returnOrder->shipment_id;
                }
                return $order;
            });
    }
}
