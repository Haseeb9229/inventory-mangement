<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\PurchaseReturn;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\User;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseReturnController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseReturn::with(['purchaseOrder.supplier', 'purchaseOrderItem', 'product', 'warehouse', 'returnedBy']);
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('purchaseOrder', fn($q) => $q->where('po_number', 'like', "%$search%"))
                ->orWhereHas('product', fn($q) => $q->where('name', 'like', "%$search%"));
        }
        if ($request->has('warehouse_id') && $request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->has('returned_by') && $request->returned_by) {
            $query->where('returned_by', $request->returned_by);
        }
        $returns = $query->orderByDesc('created_at')->paginate(15);
        $suppliers = Supplier::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        $products = Product::select('id', 'name')->get();
        $purchaseOrders = PurchaseOrder::where('status', 'received')->with(['items.product'])->get();
        return Inertia::render('Admin/PurchaseReturns/Index', [
            'returns' => $returns,
            'suppliers' => $suppliers,
            'warehouses' => $warehouses,
            'products' => $products,
            'purchaseOrders' => $purchaseOrders,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'quantity' => 'required|numeric|min:1',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $data['returned_by'] = $request->user()->id;
        $return = PurchaseReturn::create($data);
        // Inventory adjustment and movement log
        $inventoryItem = InventoryItem::where('warehouse_id', $data['warehouse_id'])
            ->where('product_id', $data['product_id'])
            ->first();
        if ($inventoryItem) {
            $inventoryItem->removeQuantity($data['quantity']);
            // Update product total quantity across all warehouses
            $totalQuantity = InventoryItem::where('product_id', $data['product_id'])->sum('quantity');
            Product::where('id', $data['product_id'])->update(['quantity' => $totalQuantity]);
        }
        InventoryMovement::create([
            'product_id' => $data['product_id'],
            'type' => 'purchase_return',
            'quantity' => $data['quantity'],
            'source_warehouse_id' => $data['warehouse_id'],
            'destination_warehouse_id' => null,
            'reference_type' => 'purchase_return',
            'reference_id' => $return->id,
            'notes' => $data['reason'] ?? 'Purchase return',
            'created_by' => $data['returned_by'],
        ]);
        return redirect()->back()->with('success', 'Purchase return created successfully.');
    }

    // Add endpoint to fetch items for a selected purchase order
    public function getPurchaseOrderItems(Request $request, $purchaseOrderId)
    {
        $order = PurchaseOrder::with(['items.product'])->findOrFail($purchaseOrderId);
        return response()->json([
            'items' => $order->items,
        ]);
    }
}
