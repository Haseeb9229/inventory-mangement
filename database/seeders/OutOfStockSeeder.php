<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\Product;
use App\Models\Warehouse;

class OutOfStockSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $warehouses = Warehouse::all();
        foreach ($products->random(5) as $product) {
            $warehouse = $warehouses->random();
            InventoryItem::updateOrCreate(
                [
                    'warehouse_id' => $warehouse->id,
                    'product_id' => $product->id,
                ],
                [
                    'quantity' => 0,
                    'unit_price' => $product->price,
                    'status' => 'out_of_stock',
                    'last_restocked_at' => now(),
                    'notes' => 'Seeder generated out of stock',
                ]
            );
        }
    }
}
