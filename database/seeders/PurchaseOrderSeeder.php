<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Database\Seeder;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = Supplier::all();
        $warehouses = Warehouse::all();
        $products = Product::all();
        $orderPlacers = User::role('order_placer')->get();

        if ($orderPlacers->isEmpty() || $suppliers->isEmpty() || $warehouses->isEmpty() || $products->isEmpty()) {
            return;
        }

        // Create 20 purchase orders
        for ($i = 1; $i <= 20; $i++) {
            $supplier = $suppliers->random();
            $warehouse = $warehouses->random();
            $orderPlacer = $orderPlacers->random();

            // Distribute statuses more evenly
            $statuses = ['draft', 'pending', 'ordered', 'partially_received', 'received'];
            $status = $statuses[array_rand($statuses)];

            // Set received_at date for received orders
            $receivedAt = $status === 'received' ? now()->subDays(rand(1, 30)) : null;

            // Set expected delivery date based on status
            $expectedDeliveryDate = $status === 'received'
                ? $receivedAt->subDays(rand(1, 5))
                : now()->addDays(rand(1, 30));

            $purchaseOrder = PurchaseOrder::create([
                'po_number' => 'PO-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'supplier_id' => $supplier->id,
                'warehouse_id' => $warehouse->id,
                'created_by' => $orderPlacer->id,
                'status' => $status,
                'total_amount' => 0,
                'tax_amount' => 0,
                'shipping_amount' => rand(10, 50),
                'grand_total' => 0,
                'expected_delivery_date' => $expectedDeliveryDate,
                'received_at' => $receivedAt,
                'notes' => "Purchase order #$i notes"
            ]);

            // Add 1-5 items to each purchase order
            $numItems = rand(1, 5);
            $selectedProducts = $products->random($numItems);

            foreach ($selectedProducts as $product) {
                $quantity = rand(5, 20); // Increased quantities for better testing
                $unitPrice = $product->price * 0.8; // 20% discount from retail price
                $taxRate = 10; // 10% tax rate

                // Set received quantity based on status
                $receivedQuantity = match($status) {
                    'received' => $quantity,
                    'partially_received' => rand(1, $quantity - 1),
                    default => 0
                };

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'received_quantity' => $receivedQuantity,
                    'unit_price' => $unitPrice,
                    'tax_rate' => $taxRate,
                    'tax_amount' => ($quantity * $unitPrice) * ($taxRate / 100),
                    'subtotal' => $quantity * $unitPrice,
                    'notes' => "Item notes for product {$product->name}"
                ]);
            }

            // Calculate and update totals
            $purchaseOrder->calculateTotals();
        }
    }
}
