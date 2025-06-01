<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\User;
use App\Models\InventoryMovement;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $query = Warehouse::query();

        // Search functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        // Sorting with defaults
        $sort = $request->sort ?? 'created_at';
        $direction = $request->direction ?? 'desc';
        $query->orderBy($sort, $direction);

        $warehouses = $query->paginate(10)->withQueryString();

        // Transform warehouses to include additional metrics
        $warehouses->getCollection()->transform(function ($warehouse) {
            return [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'code' => $warehouse->code,
                'location' => $warehouse->location,
                'capacity' => $warehouse->capacity,
                'description' => $warehouse->description,
                'owner_id' => $warehouse->owner_id,
                'created_at' => $warehouse->created_at,
                'total_products' => $warehouse->getInventoryProductsCount(),
                'total_quantity' => $warehouse->getInventoryTotalQuantity(),
                'available_capacity' => $warehouse->getAvailableCapacity(),
            ];
        });

        // Get users with warehouse_owner role
        $users = User::role('warehouse_owner')->get(['id', 'name', 'email']);

        // Ensure filters are always defined
        $filters = [
            'search' => $request->search ?? '',
            'sort' => $sort,
            'direction' => $direction,
        ];

        return Inertia::render('Admin/Warehouses/Index', [
            'warehouses' => $warehouses,
            'filters' => $filters,
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:warehouses'],
            'location' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'owner_id' => ['required', 'exists:users,id', 'unique:warehouses,owner_id', function($attribute, $value, $fail) {
                $user = User::find($value);
                if (!$user || !$user->hasRole('warehouse_owner')) {
                    $fail('The selected user must have the warehouse owner role.');
                }
            }],
        ]);

        Warehouse::create($request->all());

        return redirect()->back()->with('success', 'Warehouse created successfully.');
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('warehouses')->ignore($warehouse->id)],
            'location' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'owner_id' => ['required', 'exists:users,id', Rule::unique('warehouses', 'owner_id')->ignore($warehouse->id), function($attribute, $value, $fail) {
                $user = User::find($value);
                if (!$user || !$user->hasRole('warehouse_owner')) {
                    $fail('The selected user must have the warehouse owner role.');
                }
            }],
        ]);

        $warehouse->update($request->all());

        return redirect()->back()->with('success', 'Warehouse updated successfully.');
    }

    public function destroy(Warehouse $warehouse)
    {
        // Prevent deletion if warehouse has any inventory items (quantity > 0)
        $hasProducts = $warehouse->inventoryItems()->where('quantity', '>', 0)->exists();
        if ($hasProducts) {
            throw ValidationException::withMessages([
                'error' => 'Cannot delete warehouse: there are still products in this warehouse.',
            ]);
        }
        // Prevent deletion if warehouse has any pending or in-transit purchase orders
        $hasPendingPOs = $warehouse->purchaseOrders()->whereIn('status', ['pending', 'ordered', 'in_transit', 'partially_received'])->exists();
        if ($hasPendingPOs) {
            throw ValidationException::withMessages([
                'error' => 'Cannot delete warehouse: there are pending or in-transit purchase orders.',
            ]);
        }
        // Prevent deletion if warehouse has any pending or in-transit sales orders
        $hasPendingSOs = $warehouse->salesOrders()->whereIn('status', ['pending', 'processing', 'shipped'])->exists();
        if ($hasPendingSOs) {
            throw ValidationException::withMessages([
                'error' => 'Cannot delete warehouse: there are pending or in-transit sales orders.',
            ]);
        }
        $warehouse->delete();
        return redirect()->back()->with('success', 'Warehouse deleted successfully.');
    }

    /**
     * Move all inventory from one warehouse to another.
     */
    public function moveInventory(Request $request)
    {
        $request->validate([
            'source_warehouse_id' => 'required|exists:warehouses,id',
            'destination_warehouse_id' => 'required|exists:warehouses,id|different:source_warehouse_id',
        ]);

        $source = Warehouse::findOrFail($request->source_warehouse_id);
        $destination = Warehouse::findOrFail($request->destination_warehouse_id);

        // Pre-condition: No pending/in-transit POs
        $hasPendingPOs = $source->purchaseOrders()->whereIn('status', ['pending', 'ordered', 'in_transit', 'partially_received'])->exists();
        if ($hasPendingPOs) {
            throw ValidationException::withMessages([
                'error' => 'Cannot move inventory: source warehouse has pending or in-transit purchase orders.',
            ]);
        }
        // Pre-condition: No pending/in-transit SOs
        $hasPendingSOs = $source->salesOrders()->whereIn('status', ['pending', 'processing', 'shipped'])->exists();
        if ($hasPendingSOs) {
            throw ValidationException::withMessages([
                'error' => 'Cannot move inventory: source warehouse has pending or in-transit sales orders.',
            ]);
        }

        // Move all inventory items
        foreach ($source->inventoryItems as $item) {
            $destItem = $destination->inventoryItems()->firstOrCreate(
                ['product_id' => $item->product_id],
                [
                    'quantity' => 0,
                    'unit_price' => $item->unit_price,
                    'status' => $item->status,
                ]
            );
            $destItem->quantity += $item->quantity;
            $destItem->save();

            // Log movement for source warehouse (negative quantity)
            InventoryMovement::create([
                'product_id' => $item->product_id,
                'type' => 'move',
                'quantity' => $item->quantity,
                'source_warehouse_id' => $source->id,
                'destination_warehouse_id' => $destination->id,
                'reference_type' => 'warehouse_move',
                'reference_id' => null,
                'notes' => 'Moved to warehouse: ' . $destination->name,
                'created_by' => auth()->id(),
            ]);

            $item->delete();
        }

        return redirect()->back()->with('success', 'Inventory moved successfully.');
    }

    /**
     * Get purchase orders for a warehouse (with optional status filter).
     */
    public function getPurchaseOrders(Warehouse $warehouse, Request $request)
    {
        $query = $warehouse->purchaseOrders()->with(['supplier', 'creator', 'items.product']);
        if ($request->status) {
            $query->where('status', $request->status);
        }
        $orders = $query->orderByDesc('created_at')->paginate(10);

        // Transform the orders to include additional data
        $orders->getCollection()->transform(function ($order) {
            $totalQuantity = $order->items->sum('quantity');
            return [
                'id' => $order->id,
                'po_number' => $order->po_number,
                'supplier' => $order->supplier,
                'creator' => $order->creator,
                'created_at' => $order->created_at,
                'status' => $order->status,
                'items' => $order->items,
                'grand_total' => $order->grand_total,
                'total_quantity' => $totalQuantity,
                'product_count' => $order->items->count()
            ];
        });

        return response()->json(['orders' => $orders]);
    }

    /**
     * Get sales orders for a warehouse (with optional status filter).
     */
    public function getSalesOrders(Warehouse $warehouse, Request $request)
    {
        $query = $warehouse->salesOrders()->with(['createdBy', 'items.product']);
        if ($request->status) {
            $query->where('status', $request->status);
        }
        $orders = $query->orderByDesc('created_at')->paginate(10);

        // Transform the orders to include additional data
        $orders->getCollection()->transform(function ($order) {
            $totalQuantity = $order->items->sum('quantity');
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'created_by' => $order->createdBy,
                'created_at' => $order->created_at,
                'status' => $order->status,
                'items' => $order->items,
                'grand_total' => $order->grand_total,
                'total_quantity' => $totalQuantity,
                'product_count' => $order->items->count()
            ];
        });

        return response()->json(['orders' => $orders]);
    }

    /**
     * Get products for a warehouse.
     */
    public function getProducts(Warehouse $warehouse)
    {
        $products = $warehouse->inventoryItems()
            ->with('product')
            ->where('quantity', '>', 0)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                ];
            });

        return response()->json(['products' => $products]);
    }
}
