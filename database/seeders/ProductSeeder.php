<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}
