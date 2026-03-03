<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- | | Here is where you can register API routes for your application. These | routes are loaded by the RouteServiceProvider and all of them will | be assigned to the "api" middleware group. Make something great! | */

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShiprocketController;

Route::post('/register', [AuthController::class , 'register']);
Route::post('/login', [AuthController::class , 'login']);

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
            return $request->user();
        }
        );

        Route::post('/logout', [AuthController::class , 'logout']);

        // Shipping routes
        Route::post('/shipments', [ShiprocketController::class , 'createShipment']);
        Route::get('/shipments/track/{tracking_id}', [ShiprocketController::class , 'getTrackingDetails']);

        // Products
        Route::get('/products', [ProductController::class , 'index']);

        // Orders
        Route::post('/orders', [OrderController::class , 'store']);
        Route::get('/orders', [OrderController::class , 'userOrders']);

        // OTP
        Route::post('/verify-otp', [AuthController::class , 'verifyOtp']);

        // Admin
        Route::get('/admin/orders', [AdminController::class , 'index']);
        Route::post('/admin/orders/{id}/awb', [AdminController::class , 'updateAwb']);
    });
