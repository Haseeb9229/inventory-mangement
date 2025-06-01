<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReturn;
use App\Models\User;
use Illuminate\Support\Arr;

class PurchaseReturnSeeder extends Seeder
{
    public function run(): void
    {
        $orders = PurchaseOrder::with(['items', 'warehouse'])->where('status', 'received')->get();
        $users = User::all();
        $reasons = [
            'Damaged on arrival',
            'Wrong item delivered',
            'Quality not as expected',
            'Excess quantity',
            'Other',
        ];

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                // Only return if some quantity was received
                if ($item->received_quantity > 0 && rand(0, 1)) {
                    $returnQty = rand(1, $item->received_quantity);
                    PurchaseReturn::create([
                        'purchase_order_id' => $order->id,
                        'purchase_order_item_id' => $item->id,
                        'product_id' => $item->product_id,
                        'warehouse_id' => $order->warehouse_id,
                        'returned_by' => $users->random()->id,
                        'quantity' => $returnQty,
                        'reason' => Arr::random($reasons),
                        'notes' => 'Seeder generated return',
                    ]);
                }
            }
        }
    }
}
