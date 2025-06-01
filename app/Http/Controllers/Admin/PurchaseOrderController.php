<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\User;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'warehouse', 'creator', 'items.product']);
        if ($request->has('search') && $request->search) {
            $search = $request->input('search');
            $query->where('po_number', 'like', "%$search%")
                ->orWhereHas('supplier', fn($q) => $q->where('name', 'like', "%$search%"));
        }
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }
        if ($request->has('warehouse_id') && $request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->has('product_id') && $request->product_id) {
            $query->whereHas('items', fn($q) => $q->where('product_id', $request->product_id));
        }
        $orders = $query->orderByDesc('created_at')->paginate(10)->withQueryString();
        $suppliers = Supplier::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        $products = Product::select('id', 'name', 'price')->get();
        $filters = [
            'search' => $request->search ?? '',
            'status' => $request->status ?? '',
            'supplier_id' => $request->supplier_id ?? '',
            'warehouse_id' => $request->warehouse_id ?? '',
            'product_id' => $request->product_id ?? '',
        ];
        return Inertia::render('Admin/PurchaseOrders/Index', [
            'orders' => $orders,
            'filters' => $filters,
            'suppliers' => $suppliers,
            'warehouses' => $warehouses,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'po_number' => 'required|unique:purchase_orders',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'status' => 'required',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'shipping_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);
        $data['created_by'] = $request->user()->id;
        $items = $data['items'];
        unset($data['items']);
        $order = PurchaseOrder::create($data);
        foreach ($items as $item) {
            $quantity = $item['quantity'];
            $unit_price = $item['unit_price'];
            $tax_rate = $item['tax_rate'] ?? 0;
            $subtotal = $quantity * $unit_price;
            $tax_amount = $subtotal * ($tax_rate / 100);
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $quantity,
                'unit_price' => $unit_price,
                'tax_rate' => $tax_rate,
                'tax_amount' => $tax_amount,
                'subtotal' => $subtotal,
                'notes' => $item['notes'] ?? null,
            ]);
        }
        $order->calculateTotals();
        return redirect()->back()->with('success', 'Purchase order created successfully.');
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'status' => 'required',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'shipping_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:purchase_order_items,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);
        $items = $data['items'];
        unset($data['items']);
        // Update order fields
        $purchaseOrder->update($data);
        // Sync items
        $existingItemIds = $purchaseOrder->items()->pluck('id')->toArray();
        $sentItemIds = collect($items)->pluck('id')->filter()->toArray();
        // Delete removed items
        $toDelete = array_diff($existingItemIds, $sentItemIds);
        if (!empty($toDelete)) {
            $purchaseOrder->items()->whereIn('id', $toDelete)->delete();
        }
        // Update or create items
        foreach ($items as $item) {
            $quantity = $item['quantity'];
            $unit_price = $item['unit_price'];
            $tax_rate = $item['tax_rate'] ?? 0;
            $subtotal = $quantity * $unit_price;
            $tax_amount = $subtotal * ($tax_rate / 100);
            $itemData = [
                'product_id' => $item['product_id'],
                'quantity' => $quantity,
                'unit_price' => $unit_price,
                'tax_rate' => $tax_rate,
                'tax_amount' => $tax_amount,
                'subtotal' => $subtotal,
                'notes' => $item['notes'] ?? null,
            ];
            if (isset($item['id'])) {
                $purchaseOrder->items()->where('id', $item['id'])->update($itemData);
            } else {
                $purchaseOrder->items()->create($itemData);
            }
        }
        $purchaseOrder->calculateTotals();
        return redirect()->back()->with('success', 'Purchase order updated successfully.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();
        return redirect()->back()->with('success', 'Purchase order deleted successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'warehouse', 'creator', 'items.product']);
        return response()->json($purchaseOrder);
    }

    public function markAsOrdered(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->status = 'ordered';
        $purchaseOrder->save();
        return redirect()->route('admin.purchase-orders.index')->with('success', 'Purchase order marked as ordered.');
    }

    public function markAsReceived(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->markAsReceived();
        return redirect()->route('admin.purchase-orders.index')->with('success', 'Purchase order marked as received.');
    }

    public function markAsPartiallyReceived(Request $request, PurchaseOrder $purchaseOrder)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:purchase_order_items,id',
            'items.*.quantity' => 'required|numeric|min:0',
        ]);
        foreach ($data['items'] as $itemData) {
            $purchaseOrder->markItemAsReceived($itemData['id'], $itemData['quantity']);
        }
        return redirect()->route('admin.purchase-orders.index')->with('success', 'Purchase order marked as partially received.');
    }

    public function markAsCancelled(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->status = 'cancelled';
        $purchaseOrder->save();
        return redirect()->route('admin.purchase-orders.index')->with('success', 'Purchase order marked as cancelled.');
    }
}
