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
            'name' => $userData['name'],
            'email' => $userData['email'],
            'phone' => $userData['phone'],
            'password' => Hash::make($userData['password']),
            'otp' => $otpCode,
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
}
