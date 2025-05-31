<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
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

        // Create categories
        $categories = [
            'Electronics',
            'Clothing',
            'Books',
            'Home & Garden',
            'Sports',
            'Toys',
            'Food',
            'Health',
            'Beauty'
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }

        // Create suppliers
        $suppliers = [
            'ABC Suppliers',
            'XYZ Corporation',
            'Global Imports',
            'Local Distributors',
            'Tech Suppliers',
            'Fashion Wholesale',
            'Food Distributors',
            'Health Products Inc'
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create([
                'name' => $supplier,
                'contact_name' => 'John Doe',
                'email' => strtolower(str_replace(' ', '', $supplier)) . '@example.com',
                'phone' => '1234567890',
                'address' => '123 Supplier St'
            ]);
        }

        // Create warehouses
        $warehouses = [
            'Main Warehouse',
            'North Branch',
            'South Branch'
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::create([
                'name' => $warehouse,
                'location' => '123 Warehouse St',
                'capacity' => 1000
            ]);
        }

        // Create products
        $categoryIds = Category::pluck('id');
        $supplierIds = Supplier::pluck('id');
        $warehouseIds = Warehouse::pluck('id');

        for ($i = 1; $i <= 150; $i++) {
            Product::create([
                'name' => "Product $i",
                'description' => "Description for Product $i",
                'price' => rand(10, 1000),
                'quantity' => rand(0, 100),
                'reorder_point' => 10,
                'sold_count' => rand(0, 50),
                'category_id' => $categoryIds->random(),
                'supplier_id' => $supplierIds->random(),
                'warehouse_id' => $warehouseIds->random(),
                'sku' => "SKU-$i",
                'status' => 'active'
            ]);
        }

        // Create orders
        $users = User::pluck('id');
        $orderStatuses = ['pending', 'completed'];

        for ($i = 1; $i <= 45; $i++) {
            Order::create([
                'user_id' => $users->random(),
                'status' => $orderStatuses[rand(0, 1)],
                'total_amount' => rand(100, 1000)
            ]);
        }
    }
}
