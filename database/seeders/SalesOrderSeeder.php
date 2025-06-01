<?php

namespace Database\Seeders;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class SalesOrderSeeder extends Seeder
{
    public function run(): void
    {
        $orderPlacers = User::role('order_placer')->get();
        $warehouses = Warehouse::all();
        $products = Product::all();

        if ($orderPlacers->isEmpty() || $warehouses->isEmpty() || $products->isEmpty()) {
            return;
        }

        // Create 30 sales orders
        for ($i = 1; $i <= 30; $i++) {
            $orderPlacer = $orderPlacers->random();
            $warehouse = $warehouses->random();
            $status = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][rand(0, 4)];

            $salesOrder = SalesOrder::create([
                'order_number' => 'SO-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'created_by' => $orderPlacer->id,
                'warehouse_id' => $warehouse->id,
                'status' => $status,
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_amount' => rand(10, 50),
                'grand_total' => 0,
                'shipping_address' => '123 Main St',
                'shipping_city' => 'Sample City',
                'shipping_state' => 'Sample State',
                'shipping_country' => 'Sample Country',
                'shipping_zip_code' => '12345',
                'shipping_phone' => '1234567890',
                'shipping_email' => 'shipping@example.com',
                'shipping_method' => ['standard', 'express', 'overnight'][rand(0, 2)],
                'shipping_tracking_number' => $status === 'shipped' || $status === 'delivered' ? 'TRK-' . strtoupper(substr(md5(rand()), 0, 10)) : null,
                'shipped_at' => $status === 'shipped' || $status === 'delivered' ? now()->subDays(rand(1, 5)) : null,
                'delivered_at' => $status === 'delivered' ? now()->subDays(rand(1, 3)) : null,
                'notes' => "Sales order #$i notes"
            ]);

            // Add 1-5 items to each sales order
            $numItems = rand(1, 5);
            $selectedProducts = $products->random($numItems);

            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 5);
                $unitPrice = $product->price;
                $taxRate = 10; // 10% tax rate

                SalesOrderItem::create([
                    'sales_order_id' => $salesOrder->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'tax_rate' => $taxRate,
                    'tax_amount' => ($quantity * $unitPrice) * ($taxRate / 100),
                    'subtotal' => $quantity * $unitPrice,
                    'notes' => "Item notes for product {$product->name}"
                ]);
            }

            // Calculate and update totals
            $salesOrder->calculateTotals();
        }
    }
}
