<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\User;

class InventoryMovementSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $warehouses = Warehouse::all();
        $users = User::all();
        $types = ['in', 'out', 'move', 'adjustment', 'purchase_return', 'sale_return'];

        foreach ($types as $type) {
            for ($i = 0; $i < 5; $i++) {
                $product = $products->random();
                $user = $users->random();
                $source = null;
                $destination = null;
                if ($type === 'in' || $type === 'adjustment' || $type === 'sale_return') {
                    $destination = $warehouses->random()->id;
                }
                if ($type === 'out' || $type === 'purchase_return') {
                    $source = $warehouses->random()->id;
                }
                if ($type === 'move') {
                    $source = $warehouses->random()->id;
                    do {
                        $destination = $warehouses->random()->id;
                    } while ($destination === $source);
                }
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => $type,
                    'quantity' => rand(1, 10),
                    'source_warehouse_id' => $source,
                    'destination_warehouse_id' => $destination,
                    'reference_type' => $type,
                    'reference_id' => null,
                    'notes' => 'Seeder generated movement',
                    'created_by' => $user->id,
                ]);
            }
        }
    }
}
