<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $warehouseOwnerRole = Role::firstOrCreate(['name' => 'warehouse_owner']);
        $orderPlacerRole = Role::firstOrCreate(['name' => 'order_placer']);

        // Assign admin role to admin@example.com
        $admin = User::where('email', 'admin@example.com')->first();
        if ($admin) {
            $admin->assignRole($adminRole);
        }

        // Assign warehouse owner role to user1 and user2
        User::whereIn('email', ['user1@example.com', 'user2@example.com'])->get()
            ->each(function ($user) use ($warehouseOwnerRole) {
                $user->assignRole($warehouseOwnerRole);
            });

        // Assign order placer role to user3, user4, and user5
        User::whereIn('email', ['user3@example.com', 'user4@example.com', 'user5@example.com'])->get()
            ->each(function ($user) use ($orderPlacerRole) {
                $user->assignRole($orderPlacerRole);
            });
    }
}
