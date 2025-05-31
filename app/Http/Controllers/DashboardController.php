<?php
namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
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
            'inventory_items_count' => Product::count(),
            'orders_count' => Order::count(),
            'suppliers_count' => Supplier::count(),
            'low_stock_items_count' => Product::where('quantity', '<=', DB::raw('reorder_point'))->count(),
            'out_of_stock_items_count' => Product::where('quantity', 0)->count(),
            'pending_orders_count' => Order::where('status', 'pending')->count(),
            'completed_orders_count' => Order::where('status', 'completed')->count(),
            'categories_count' => Category::count(),
            'inventory_value' => '$' . number_format(Product::sum(DB::raw('quantity * price')), 2),
            'top_selling_count' => Product::where('sold_count', '>', 0)
                ->orderBy('sold_count', 'desc')
                ->limit(10)
                ->count(),
        ];

        return Inertia::render('Dashboard', [
            'statsData' => $stats,
            'userRole' => 'admin'
        ]);
    }
}
