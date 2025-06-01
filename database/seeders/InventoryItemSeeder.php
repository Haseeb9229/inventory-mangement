<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use Illuminate\Database\Seeder;

class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        // Get all received purchase orders
        $receivedOrders = PurchaseOrder::where('status', 'received')
            ->with(['items', 'warehouse'])
            ->get();

        foreach ($receivedOrders as $order) {
            foreach ($order->items as $item) {
                // Create or update inventory item
                InventoryItem::updateOrCreate(
                    [
                        'warehouse_id' => $order->warehouse_id,
                        'product_id' => $item->product_id,
                    ],
                    [
                        'quantity' => $item->received_quantity,
                        'unit_price' => $item->unit_price,
                        'status' => 'in_stock',
                        'last_restocked_at' => $order->received_at,
                        'notes' => "Initial stock from PO: {$order->po_number}"
                    ]
                );
            }
        }
    }
}
