<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Validation\ValidationException;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'location',
        'capacity',
        'description',
        'owner_id',
    ];

    protected $casts = [
        'capacity' => 'float',
    ];

    /**
     * Get the owner of the warehouse.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the inventory items in this warehouse.
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    /**
     * Get the products in this warehouse through inventory items.
     */
    public function products(): HasManyThrough
    {
        return $this->hasManyThrough(Product::class, InventoryItem::class);
    }

    /**
     * Get the purchase orders for this warehouse.
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    /**
     * Get the sales orders for this warehouse.
     */
    public function salesOrders(): HasMany
    {
        return $this->hasMany(\App\Models\SalesOrder::class);
    }

    /**
     * Get the purchase returns for this warehouse.
     */
    public function purchaseReturns()
    {
        return $this->hasMany(PurchaseReturn::class);
    }

    /**
     * Get the total number of unique products in this warehouse from received purchase orders.
     */
    public function getTotalProductsCount(): int
    {
        return $this->purchaseOrders()
            ->where('status', 'received')
            ->with('items')
            ->get()
            ->flatMap(function ($order) {
                return $order->items->pluck('product_id');
            })
            ->unique()
            ->count();
    }

    /**
     * Get the total quantity of all products in this warehouse from received purchase orders.
     */
    public function getTotalQuantity(): float
    {
        return $this->purchaseOrders()
            ->where('status', 'received')
            ->with('items')
            ->get()
            ->sum(function ($order) {
                return $order->items->sum('received_quantity');
            });
    }

    /**
     * Check if the warehouse has available capacity.
     */
    public function hasAvailableCapacity(float $requiredCapacity): bool
    {
        $usedCapacity = $this->inventoryItems()->sum('quantity');
        return ($usedCapacity + $requiredCapacity) <= $this->capacity;
    }

    /**
     * Get the available capacity of the warehouse.
     */
    public function getAvailableCapacity(): float
    {
        $usedCapacity = $this->inventoryItems()->sum('quantity');
        return $this->capacity - $usedCapacity;
    }

    // Number of unique products currently in stock
    public function getInventoryProductsCount(): int
    {
        return $this->inventoryItems()->where('quantity', '>', 0)->distinct('product_id')->count('product_id');
    }

    // Total quantity of all products currently in stock
    public function getInventoryTotalQuantity(): float
    {
        return $this->inventoryItems()->sum('quantity');
    }
}
