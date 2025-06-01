<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $warehouseOwnerRole = Role::firstOrCreate(['name' => 'warehouse_owner']);
        $orderPlacerRole = Role::firstOrCreate(['name' => 'order_placer']);

        // Create admin user and assign role
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole($adminRole);

        // Create warehouse owners and assign roles
        for ($i = 1; $i <= 2; $i++) {
            $user = User::create([
                'name' => "Warehouse Owner $i",
                'email' => "user$i@example.com",
                'password' => Hash::make('password'),
            ]);
            $user->assignRole($warehouseOwnerRole);
        }

        // Create order placers and assign roles
        for ($i = 3; $i <= 5; $i++) {
            $user = User::create([
                'name' => "Order Placer $i",
                'email' => "user$i@example.com",
                'password' => Hash::make('password'),
            ]);
            $user->assignRole($orderPlacerRole);
        }
    }
}
