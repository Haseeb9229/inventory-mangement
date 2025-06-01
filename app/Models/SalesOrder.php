<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\InventoryMovement;

class SalesOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'created_by',
        'warehouse_id',
        'status',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'grand_total',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_country',
        'shipping_zip_code',
        'shipping_phone',
        'shipping_email',
        'shipping_method',
        'shipping_tracking_number',
        'shipped_at',
        'delivered_at',
        'notes'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime'
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function calculateTotals(): void
    {
        $this->subtotal = $this->items->sum('subtotal');
        $this->tax_amount = $this->items->sum('tax_amount');
        $this->grand_total = $this->subtotal + $this->tax_amount + $this->shipping_amount;
        $this->save();
    }

    public function canBeShipped(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function canBeDelivered(): bool
    {
        return $this->status === 'shipped';
    }

    public function markAsShipped(string $trackingNumber): void
    {
        if (!$this->canBeShipped()) {
            throw new \Exception('Order cannot be shipped in its current status.');
        }

        $this->status = 'shipped';
        $this->shipping_tracking_number = $trackingNumber;
        $this->shipped_at = now();
        $this->save();
    }

    public function markAsDelivered(): void
    {
        if (!$this->canBeDelivered()) {
            throw new \Exception('Order cannot be marked as delivered in its current status.');
        }

        $this->status = 'delivered';
        $this->delivered_at = now();
        $this->save();
    }

    /**
     * Process the sales order and update inventory.
     */
    public function process(): void
    {
        if ($this->status !== 'pending') {
            throw new \Exception('Only pending orders can be processed.');
        }

        // Check and update inventory for each item
        foreach ($this->items as $item) {
            $inventoryItem = InventoryItem::where('warehouse_id', $this->warehouse_id)
                ->where('product_id', $item->product_id)
                ->first();

            if (!$inventoryItem || $inventoryItem->quantity < $item->quantity) {
                throw new \Exception("Insufficient inventory for product: {$item->product->name}");
            }

            // Remove quantity from inventory
            $inventoryItem->removeQuantity($item->quantity);

            // Log inventory movement (type: 'out')
            InventoryMovement::create([
                'product_id' => $item->product_id,
                'type' => 'out',
                'quantity' => $item->quantity,
                'source_warehouse_id' => $this->warehouse_id,
                'destination_warehouse_id' => null,
                'reference_type' => 'sales_order',
                'reference_id' => $this->id,
                'notes' => 'Fulfilled via SO: ' . $this->order_number,
                'created_by' => $this->created_by,
            ]);
        }

        // Update order status
        $this->status = 'processing';
        $this->save();
    }

    /**
     * Cancel the sales order and restore inventory.
     */
    public function cancel(): void
    {
        if (!in_array($this->status, ['pending', 'processing'])) {
            throw new \Exception('Only pending or processing orders can be cancelled.');
        }

        // Restore inventory for each item
        foreach ($this->items as $item) {
            $inventoryItem = InventoryItem::where('warehouse_id', $this->warehouse_id)
                ->where('product_id', $item->product_id)
                ->first();

            if ($inventoryItem) {
                $inventoryItem->addQuantity($item->quantity);
            }
        }

        // Update order status
        $this->status = 'cancelled';
        $this->save();
    }
}
