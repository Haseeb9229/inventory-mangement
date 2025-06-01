<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\PurchaseOrder;
use App\Models\SalesOrder;
use App\Models\InventoryItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        // Get all admin stats
        $stats = [
            'users_count' => User::count(),
            'warehouses_count' => Warehouse::count(),
            'products_count' => Product::count(),
            'purchase_orders_count' => PurchaseOrder::count(),
            'sales_orders_count' => SalesOrder::count(),
            'suppliers_count' => Supplier::count(),
            'low_stock_items_count' => InventoryItem::where('status', 'low_stock')->count(),
            'out_of_stock_items_count' => InventoryItem::where('status', 'out_of_stock')->count(),
            'pending_purchase_orders' => PurchaseOrder::whereIn('status', ['draft', 'pending', 'ordered'])->count(),
            'pending_sales_orders' => SalesOrder::whereIn('status', ['pending', 'processing'])->count(),
            'inventory_value' => '$' . number_format(InventoryItem::sum(DB::raw('quantity * unit_price')), 2),
            'total_products_in_stock' => InventoryItem::where('status', 'in_stock')->count(),
            'total_quantity_in_stock' => InventoryItem::sum('quantity'),
            'total_sales_value' => '$' . number_format(SalesOrder::where('status', 'delivered')->sum('grand_total'), 2),
            'total_purchase_value' => '$' . number_format(PurchaseOrder::where('status', 'received')->sum('grand_total'), 2),
            'delivered_orders_count' => SalesOrder::where('status', 'delivered')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'statsData' => $stats,
            'userRole' => Auth::user()->roles->first()->name ?? 'user'
        ]);
    }
}
