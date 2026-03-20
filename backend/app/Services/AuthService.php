<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function createUserWithOtp(array $userData): User
    {
        $otpCode = rand(100000, 999999);

        $user = User::create([
            'name'     => $userData['name'],
            'email'    => $userData['email'],
            'phone'    => $userData['phone'],
            'password' => Hash::make($userData['password']),
            'otp'      => $otpCode,
            'otp_updated_at' => now(),
        ]);

        Log::info("[OTP] To: {$user->phone} - Your Boutique verification code is: {$otpCode}");

        return $user;
    }

    public function verifyUserOtp(User $user, string $otp): bool
    {
        if ($user->otp === $otp) {
            $user->otp_verified_at = now();
            $user->otp = null;
            $user->save();
            return true;
        }
        return false;
    }

    /**
     * Regenerate OTP for an existing user.
     * Uses otp_updated_at (dedicated column) for cooldown — never updated_at.
     * Returns false if called within 30 seconds of the last regeneration.
     */
    public function regenerateOtp(User $user): bool
    {
        // Cooldown check against dedicated column only
        if ($user->otp_updated_at && now()->diffInSeconds($user->otp_updated_at) < 30) {
            return false;
        }

        $otpCode = rand(100000, 999999);

        // Disable auto-timestamping so updated_at is not mutated
        $user->timestamps = false;
        $user->otp = $otpCode;
        $user->otp_updated_at = now();
        $user->save();
        $user->timestamps = true; // Restore for any future operations

        Log::info("[OTP RESEND] To: {$user->phone} - Your new Boutique code is: {$otpCode}");

        return true;
    }
}

