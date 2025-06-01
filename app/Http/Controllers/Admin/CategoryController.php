<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\User;
use App\Notifications\AdminActionNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query();
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
            ;
        }
        $categories = $query->orderByDesc('created_at')->paginate(10)->withQueryString();
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string',
            ]);
            $category = Category::create($data);
            // $admins = User::role('admin')->get();
            // foreach ($admins as $admin) {
            //     $admin->notify(new AdminActionNotification([
            //         'title' => 'Category Create',
            //         'message' => "Category '{$category->name}' was created by {$request->user()->name}.",
            //         'action' => 'Create',
            //         'model' => 'Category',
            //         'model_id' => $category->id,
            //         'by' => $request->user()->name,
            //         'at' => now(),
            //     ]));
            // }
            return redirect()->back()->with('success', 'Category created successfully.');
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors($e->errors());
            }
            throw $e;
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
                'description' => 'nullable|string',
            ]);
            $category->update($data);
            // $admins = User::role('admin')->get();
            // foreach ($admins as $admin) {
            //     $admin->notify(new AdminActionNotification([
            //         'title' => 'Category Updated',
            //         'message' => "Category '{$category->name}' was updated by {$request->user()->name}.",
            //         'action' => 'Update',
            //         'model' => 'Category',
            //         'model_id' => $category->id,
            //         'by' => $request->user()->name,
            //         'at' => now(),
            //     ]));
            // }
            return redirect()->back()->with('success', 'Category updated successfully.');
        } catch (ValidationException $e) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors($e->errors());
            }
            throw $e;
        }
    }
}
