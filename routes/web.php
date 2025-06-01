<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Admin\InventoryController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

        // User management routes
        Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

        // Warehouse management routes
        Route::get('/warehouses', [WarehouseController::class, 'index'])->name('admin.warehouses.index');
        Route::post('/warehouses', [WarehouseController::class, 'store'])->name('admin.warehouses.store');
        Route::put('/warehouses/{warehouse}', [WarehouseController::class, 'update'])->name('admin.warehouses.update');
        Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy'])->name('admin.warehouses.destroy');
        Route::post('/warehouses/move-inventory', [WarehouseController::class, 'moveInventory'])->name('admin.warehouses.move-inventory');
        Route::get('/warehouses/{warehouse}/purchase-orders', [WarehouseController::class, 'getPurchaseOrders'])->name('admin.warehouses.purchase-orders');
        Route::get('/warehouses/{warehouse}/sales-orders', [WarehouseController::class, 'getSalesOrders'])->name('admin.warehouses.sales-orders');
        Route::get('/warehouses/{warehouse}/products', [WarehouseController::class, 'getProducts'])->name('admin.warehouses.products');

        // Inventory management routes
        Route::get('/inventory', [InventoryController::class, 'index'])->name('admin.inventory.index');
        Route::get('/inventory/in-stock', [InventoryController::class, 'inStock'])->name('admin.inventory.in-stock');
        Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock'])->name('admin.inventory.low-stock');
        Route::get('/inventory/out-of-stock', [InventoryController::class, 'outOfStock'])->name('admin.inventory.out-of-stock');
        Route::get('/inventory/movements', [InventoryController::class, 'movements'])->name('admin.inventory.movements');
        Route::post('/inventory/{inventoryItem}/adjust', [InventoryController::class, 'adjust'])->name('admin.inventory.adjust');

        // Add other admin routes here
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
