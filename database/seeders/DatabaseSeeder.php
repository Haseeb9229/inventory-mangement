<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,        // First create roles and users
            CategorySeeder::class,    // Then categories
            SupplierSeeder::class,    // Then suppliers
            WarehouseSeeder::class,   // Then warehouses
            ProductSeeder::class,     // Then products
            PurchaseOrderSeeder::class,
            InventoryItemSeeder::class,
            SalesOrderSeeder::class,
            InventoryMovementSeeder::class,
            OutOfStockSeeder::class,
        ]);
    }
}
