<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $warehouses = [
            'Main Warehouse',
            'North Branch',
            'South Branch'
        ];

        $warehouseOwners = User::role('warehouse_owner')->get();

        // If no warehouse owners found, get admin user as fallback
        if ($warehouseOwners->isEmpty()) {
            $warehouseOwners = User::role('admin')->get();
        }

        // When assigning owner_id, ensure each owner is only used once
        // Use a loop over unique warehouse_owner users and assign one warehouse per owner
        foreach ($warehouses as $index => $warehouse) {
            // Cycle through available owners if we have fewer owners than warehouses
            $ownerIndex = $index % $warehouseOwners->count();
            $owner = $warehouseOwners[$ownerIndex];

            Warehouse::create([
                'name' => $warehouse,
                'code' => 'WH-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'location' => '123 Warehouse St',
                'capacity' => 1000,
                'description' => "Storage facility for $warehouse",
                'owner_id' => $owner->id
            ]);
        }
    }
}
