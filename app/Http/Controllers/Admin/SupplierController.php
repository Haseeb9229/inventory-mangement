<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
                ->orWhere('contact_name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%")
                ->orWhere('phone', 'like', "%$search%")
                ->orWhere('address', 'like', "%$search%")
                ;
        }
        $suppliers = $query->orderByDesc('created_at')->paginate(10)->withQueryString();
        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'contact_name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:suppliers,email',
                'phone' => 'required|string|max:50',
                'address' => 'required|string|max:255',
            ]);
            Supplier::create($data);
            return redirect()->back()->with('success', 'Supplier created successfully.');
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors($e->errors());
            }
            throw $e;
        }
    }

    public function update(Request $request, Supplier $supplier)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'contact_name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:suppliers,email,' . $supplier->id,
                'phone' => 'required|string|max:50',
                'address' => 'required|string|max:255',
            ]);
            $supplier->update($data);
            return redirect()->back()->with('success', 'Supplier updated successfully.');
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors($e->errors());
            }
            throw $e;
        }
    }
}
