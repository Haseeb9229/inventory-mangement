<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the warehouses owned by the user.
     */
    public function ownedWarehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class, 'owner_id');
    }

    /**
     * Get the purchase orders created by the user.
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'created_by');
    }

    /**
     * Get the sales orders created by the user.
     */
    public function salesOrders(): HasMany
    {
        return $this->hasMany(SalesOrder::class, 'created_by');
    }

    /**
     * Check if the user is a warehouse owner.
     */
    public function isWarehouseOwner(): bool
    {
        return $this->hasRole('warehouse_owner');
    }

    /**
     * Check if the user is an order placer.
     */
    public function isOrderPlacer(): bool
    {
        return $this->hasRole('order_placer');
    }
}
