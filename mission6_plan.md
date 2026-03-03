# Mission 6: Messaging & Notification Module Implementation Plan

## Step 1: Backend Messaging Service (Laravel)

We will create a structured `NotificationService` in Laravel to handle custom external communication, such as mocked WhatsApp/SMS alerts.

**`backend/app/Services/NotificationService.php`** (New File)
```php
namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Order;

class NotificationService
{
    public function sendOrderNotification(Order $order)
    {
        // For simulation purposes, we assume the user has a phone number. 
        // We will default to a placeholder if it doesn't exist on the User model.
        $userPhone = $order->user->phone ?? '+91-9876543210';
        
        $message = "Your Boutique order #{$order->id} has been shipped! Track here: {$order->tracking_id}";
        
        // Log the message to simulate sending an SMS/WhatsApp integration (e.g., Twilio / Gupshup)
        Log::info("To: [{$userPhone}], Message: {$message}");
    }
}
```

## Step 2: Linking to Shiprocket (OrderController)

We will modify the existing `OrderController@store` method. Once the Shiprocket connection successfully returns a `tracking_id` and the order is updated, we will instantiate the `NotificationService` and fire the simulated message.

**Update in `backend/app/Http/Controllers/Api/OrderController.php`:**
```php
// Existing Shiprocket logic...
$responseData = json_decode($shipmentResponse->getContent());
$trackingId = $responseData->tracking_id ?? 'Error';

// NEW: Fire the Notification Service
$notificationService = new \App\Services\NotificationService();
$notificationService->sendOrderNotification($order->fresh());

return response()->json([ ... ]);
```

We will also need a new endpoint to fetch past orders for the user:
```php
// In OrderController
public function userOrders(Request $request) {
    // Returns orders for the authenticated user
    return response()->json($request->user()->orders()->orderBy('created_at', 'desc')->get());
}
```

## Step 3: Frontend 'Order History' Table (Angular)

We will generate a new component (`MyOrdersComponent`) and add routing for `/my-orders`.

**Table UI Design (`frontend/src/app/my-orders/my-orders.component.ts`)**:
I will use a clean, premium HTML table styling matching the `Outfit` font and soft gold (`#b28e6c`) color scheme.

*Appearance Preview:*
- **Container**: A clean white card with a soft shadow and rounded corners.
- **Table Header**: Very light beige background, with uppercase soft-gold text.
- **Rows**:
  - **Order ID**: #12
  - **Date**: 24 Oct, 2026
  - **Total**: ₹12,500
  - **Status**: A small pill badge (Green for `shipped`, Yellow for `pending`).
  - **Tracking**: `SR983421` with a sleek "Track on Shiprocket" ghost button.
  
**Mock Tracking Alert Logic**:
```typescript
trackOrder(trackingId: string) {
    alert(`Redirecting to Shiprocket Tracking for ID: ${trackingId}\n\n[MOCK: Real life would open link]`);
}
```

## Review Request
Please read over this implementation plan! If the styling and structural integration of the `NotificationService` look perfect to you, I will proceed to build this out!
