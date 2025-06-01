<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity',
        'received_quantity',
        'unit_price',
        'tax_rate',
        'tax_amount',
        'subtotal',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'received_quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function calculateTotals(): void
    {
        $this->subtotal = $this->quantity * $this->unit_price;
        $this->tax_amount = $this->subtotal * ($this->tax_rate / 100);
        $this->save();
    }

    public function isFullyReceived(): bool
    {
        return $this->quantity === $this->received_quantity;
    }

    public function isPartiallyReceived(): bool
    {
        return $this->received_quantity > 0 && $this->quantity > $this->received_quantity;
    }
}
