<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    protected $fillable = [
        'warehouse_id',
        'product_id',
        'quantity',
        'unit_price',
        'status',
        'last_restocked_at',
        'notes'
    ];

    protected $casts = [
        'quantity' => 'float',
        'unit_price' => 'decimal:2',
        'last_restocked_at' => 'datetime',
    ];

    /**
     * Get the warehouse that owns the inventory item.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Get the product associated with the inventory item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if the item is in stock.
     */
    public function isInStock(): bool
    {
        return $this->quantity > 0;
    }

    /**
     * Check if the item is low in stock.
     */
    public function isLowInStock(): bool
    {
        return $this->quantity <= $this->product->reorder_point;
    }

    /**
     * Update the inventory item status based on quantity.
     */
    public function updateStatus(): void
    {
        if ($this->quantity <= 0) {
            $this->status = 'out_of_stock';
        } elseif ($this->isLowInStock()) {
            $this->status = 'low_stock';
        } else {
            $this->status = 'in_stock';
        }
        $this->save();
    }

    /**
     * Add quantity to inventory and update status.
     */
    public function addQuantity(float $quantity): void
    {
        $this->quantity += $quantity;
        $this->last_restocked_at = now();
        $this->updateStatus();
    }

    /**
     * Remove quantity from inventory and update status.
     */
    public function removeQuantity(float $quantity): void
    {
        if ($this->quantity < $quantity) {
            throw new \Exception('Insufficient quantity in inventory.');
        }
        $this->quantity -= $quantity;
        $this->updateStatus();
    }

    /**
     * Get the total value of this inventory item.
     */
    public function getTotalValue(): float
    {
        return $this->quantity * $this->unit_price;
    }
}
