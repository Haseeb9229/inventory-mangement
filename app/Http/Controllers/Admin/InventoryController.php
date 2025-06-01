<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::with(['product', 'warehouse'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->warehouse_id, function ($query, $warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            });

        $inventory = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Inventory/Index', [
            'inventory' => $inventory,
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    public function inStock(Request $request)
    {
        $query = InventoryItem::with(['product', 'warehouse'])
            ->where('quantity', '>', 0)
            ->whereHas('product', function ($query) {
                $query->whereRaw('inventory_items.quantity > products.reorder_point');
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->warehouse_id, function ($query, $warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            });

        $inventory = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Inventory/InStock', [
            'inventory' => $inventory,
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    public function lowStock(Request $request)
    {
        $query = InventoryItem::with(['product', 'warehouse'])
            ->whereHas('product', function ($query) {
                $query->whereRaw('inventory_items.quantity <= products.reorder_point');
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->warehouse_id, function ($query, $warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            });

        $inventory = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Inventory/LowStock', [
            'inventory' => $inventory,
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    public function outOfStock(Request $request)
    {
        $query = InventoryItem::with(['product', 'warehouse'])
            ->where('quantity', 0)
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->warehouse_id, function ($query, $warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            });

        $inventory = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Inventory/OutOfStock', [
            'inventory' => $inventory,
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    public function movements(Request $request)
    {
        $query = InventoryMovement::with(['product', 'sourceWarehouse', 'destinationWarehouse', 'creator'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->warehouse_id, function ($query, $warehouseId) {
                $query->where(function ($q) use ($warehouseId) {
                    $q->where('source_warehouse_id', $warehouseId)
                      ->orWhere('destination_warehouse_id', $warehouseId);
                });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            });

        $movements = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Inventory/Movements', [
            'movements' => $movements,
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id', 'type']),
        ]);
    }

    public function adjust(Request $request, $id)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|numeric|min:0',
            'notes' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);
            $warehouse = Warehouse::findOrFail($request->warehouse_id);

            // Get or create inventory item
            $inventoryItem = InventoryItem::firstOrCreate(
                [
                    'warehouse_id' => $warehouse->id,
                    'product_id' => $product->id,
                ],
                [
                    'quantity' => 0,
                    'unit_price' => $product->price,
                    'status' => 'in_stock',
                ]
            );

            $oldQuantity = $inventoryItem->quantity;
            $newQuantity = $request->quantity;

            // Update inventory item
            $inventoryItem->quantity = $newQuantity;
            $inventoryItem->updateStatus();
            $inventoryItem->save();

            // Create inventory movement record
            InventoryMovement::create([
                'product_id' => $product->id,
                'type' => 'adjustment',
                'quantity' => $newQuantity - $oldQuantity,
                'destination_warehouse_id' => $warehouse->id,
                'reference_type' => 'manual_adjustment',
                'reference_id' => null,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            DB::commit();
            return back()->with('success', 'Inventory adjusted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to adjust inventory: ' . $e->getMessage());
        }
    }
}
