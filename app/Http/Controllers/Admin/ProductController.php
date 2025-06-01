<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Models\Category;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
                ->orWhere('sku', 'like', "%$search%")
                ->orWhere('barcode', 'like', "%$search%")
                ;
        }
        $products = $query->with(['category'])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();
        $categories = Category::all(['id', 'name']);
        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'reorder_point' => 'required|integer|min:0',
                'sold_count' => 'nullable|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'sku' => 'required|string|max:255|unique:products,sku',
                'barcode' => 'nullable|string|max:255',
                'status' => 'required|string|max:50',
            ]);
            Product::create($data);
            return redirect()->back()->with('success', 'Product created successfully.');
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors($e->errors());
            }
            throw $e;
        }
    }

    public function update(Request $request, Product $product)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'reorder_point' => 'required|integer|min:0',
                'sold_count' => 'nullable|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
                'barcode' => 'nullable|string|max:255',
                'status' => 'required|string|max:50',
            ]);
            $product->update($data);
            return redirect()->back()->with('success', 'Product updated successfully.');
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors($e->errors());
            }
            throw $e;
        }
    }
}
