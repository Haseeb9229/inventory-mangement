<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\InventoryMovement;

class PurchaseOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'po_number',
        'supplier_id',
        'warehouse_id',
        'created_by',
        'status',
        'total_amount',
        'tax_amount',
        'shipping_amount',
        'grand_total',
        'expected_delivery_date',
        'received_at',
        'notes',
    ];

    protected $casts = [
        'expected_delivery_date' => 'date',
        'received_at' => 'date',
        'total_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function calculateTotals(): void
    {
        $this->total_amount = $this->items->sum('subtotal');
        $this->tax_amount = $this->items->sum('tax_amount');
        $this->grand_total = $this->total_amount + $this->tax_amount + $this->shipping_amount;
        $this->save();
    }

    public function isFullyReceived(): bool
    {
        return $this->items->every(function ($item) {
            return $item->quantity === $item->received_quantity;
        });
    }

    public function isPartiallyReceived(): bool
    {
        return $this->items->some(function ($item) {
            return $item->received_quantity > 0 && $item->quantity > $item->received_quantity;
        });
    }

    /**
     * Mark the purchase order as received and update inventory.
     */
    public function markAsReceived(): void
    {
        if ($this->status === 'received') {
            throw new \Exception('Purchase order is already received.');
        }

        // Update inventory for each item
        foreach ($this->items as $item) {
            $remainingQuantity = $item->quantity - $item->received_quantity;
            if ($remainingQuantity > 0) {
                // Get or create inventory item
                $inventoryItem = InventoryItem::firstOrCreate(
                    [
                        'warehouse_id' => $this->warehouse_id,
                        'product_id' => $item->product_id,
                    ],
                    [
                        'quantity' => 0,
                        'unit_price' => $item->unit_price,
                        'status' => 'out_of_stock',
                    ]
                );

                // Add remaining quantity to inventory
                $inventoryItem->addQuantity($remainingQuantity);

                // Update product total quantity across all warehouses
                $totalQuantity = InventoryItem::where('product_id', $item->product_id)->sum('quantity');
                Product::where('id', $item->product_id)->update(['quantity' => $totalQuantity]);

                // Log inventory movement (type: 'in')
                InventoryMovement::create([
                    'product_id' => $item->product_id,
                    'type' => 'in',
                    'quantity' => $remainingQuantity,
                    'source_warehouse_id' => null,
                    'destination_warehouse_id' => $this->warehouse_id,
                    'reference_type' => 'purchase_order',
                    'reference_id' => $this->id,
                    'notes' => 'Received via PO: ' . $this->po_number,
                    'created_by' => $this->created_by,
                ]);
            }
        }

        // Update purchase order status
        $this->status = 'received';
        $this->received_at = now();
        $this->save();
    }

    /**
     * Mark a specific item as received and update inventory.
     */
    public function markItemAsReceived(int $itemId, int $quantity): void
    {
        $item = $this->items()->findOrFail($itemId);

        if ($item->received_quantity + $quantity > $item->quantity) {
            throw new \Exception('Received quantity cannot exceed ordered quantity.');
        }

        // Update inventory
        $inventoryItem = InventoryItem::firstOrCreate(
            [
                'warehouse_id' => $this->warehouse_id,
                'product_id' => $item->product_id,
            ],
            [
                'quantity' => 0,
                'unit_price' => $item->unit_price,
                'status' => 'out_of_stock',
            ]
        );

        $inventoryItem->addQuantity($quantity);

        // Update product total quantity across all warehouses
        $totalQuantity = InventoryItem::where('product_id', $item->product_id)->sum('quantity');
        Product::where('id', $item->product_id)->update(['quantity' => $totalQuantity]);

        // Log inventory movement (type: 'in')
        InventoryMovement::create([
            'product_id' => $item->product_id,
            'type' => 'in',
            'quantity' => $quantity,
            'source_warehouse_id' => null,
            'destination_warehouse_id' => $this->warehouse_id,
            'reference_type' => 'purchase_order',
            'reference_id' => $this->id,
            'notes' => 'Received via PO: ' . $this->po_number,
            'created_by' => $this->created_by,
        ]);

        // Update received quantity
        $item->received_quantity += $quantity;
        $item->save();

        // Update purchase order status
        if ($this->isFullyReceived()) {
            $this->status = 'received';
            $this->received_at = now();
        } elseif ($this->isPartiallyReceived()) {
            $this->status = 'partially_received';
        }
        $this->save();
    }

    public function purchaseReturns()
    {
        return $this->hasMany(PurchaseReturn::class);
    }
}
