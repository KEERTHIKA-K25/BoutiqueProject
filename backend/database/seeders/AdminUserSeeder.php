<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
        ['email' => 'admin@luxelace.com'],
        [
            'name' => 'Admin User',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
        ]
        );
    }
}
