<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PurchaseOrderController;
use App\Http\Controllers\Admin\PurchaseReturnController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

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

        // Purchase order routes
        Route::resource('purchase-orders', PurchaseOrderController::class)->names('admin.purchase-orders');
        Route::post('purchase-orders/{purchaseOrder}/mark-as-ordered', [PurchaseOrderController::class, 'markAsOrdered'])->name('admin.purchase-orders.mark-as-ordered');
        Route::post('purchase-orders/{purchaseOrder}/mark-as-received', [PurchaseOrderController::class, 'markAsReceived'])->name('admin.purchase-orders.mark-as-received');
        Route::post('purchase-orders/{purchaseOrder}/mark-as-partially-received', [PurchaseOrderController::class, 'markAsPartiallyReceived'])->name('admin.purchase-orders.mark-as-partially-received');
        Route::post('purchase-orders/{purchaseOrder}/mark-as-cancelled', [PurchaseOrderController::class, 'markAsCancelled'])->name('admin.purchase-orders.mark-as-cancelled');

        // Purchase return routes
        Route::resource('purchase-returns', PurchaseReturnController::class)->names('admin.purchase-returns');
        Route::get('purchase-returns', [PurchaseReturnController::class, 'index'])->name('admin.purchase-returns.index');
        Route::get('purchase-returns/po-items/{purchaseOrder}', [PurchaseReturnController::class, 'getPurchaseOrderItems'])->name('admin.purchase-returns.po-items');

        // Supplier management routes
        Route::resource('suppliers', \App\Http\Controllers\Admin\SupplierController::class)->only(['index', 'store', 'update'])->names('admin.suppliers');

        // Category management routes
        Route::resource('categories', App\Http\Controllers\Admin\CategoryController::class)->only(['index', 'store', 'update']);

        // Product management routes
        Route::resource('products', App\Http\Controllers\Admin\ProductController::class)->only(['index', 'store', 'update']);

        // Mark a single notification as read
        Route::post('/notifications/{id}/read', function ($id) {
            $user = Auth::user();
            if (!$user)
                return response()->json(['error' => 'Unauthorized'], 401);
            $notification = $user->notifications()->findOrFail($id);
            $notification->markAsRead();
            return redirect()->back();
        });

        // Mark all notifications as read
        Route::post('/notifications/mark-all-read', function (Request $request) {
            $user = Auth::user();
            if (!$user)
                return response()->json(['error' => 'Unauthorized'], 401);
            $user->unreadNotifications->markAsRead();
            return redirect()->back();
        });

        // Add other admin routes here
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


});

require __DIR__ . '/auth.php';
