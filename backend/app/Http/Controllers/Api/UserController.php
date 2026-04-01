<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Return the authenticated user's saved address + name + phone
     * for the Angular "Deliver to" summary card.
     */
    public function getAddress(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'name'    => $user->name,
            'phone'   => $user->phone,
            'address' => $user->address,
            'city'    => $user->city,
            'state'   => $user->state,
            'pincode' => $user->pincode,
        ]);
    }

    /**
     * Update the authenticated user's saved address.
     * Called from the "My Saved Address" section in My Orders.
     */
    public function updateAddress(Request $request)
    {
        $request->validate([
            'address' => 'required|string|max:255',
            'city'    => 'required|string|max:100',
            'state'   => 'required|string|max:100',
            'pincode' => 'required|digits:6',
        ]);

        $request->user()->update([
            'address' => $request->address,
            'city'    => $request->city,
            'state'   => $request->state,
            'pincode' => $request->pincode,
        ]);

        return response()->json(['message' => 'Address updated successfully.']);
    }
}
