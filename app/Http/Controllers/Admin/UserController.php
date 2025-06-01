<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with('roles')
            ->where('id', '!=', auth()->id());

        // Search functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Sorting with defaults
        $sort = $request->sort ?? 'created_at';
        $direction = $request->direction ?? 'desc';
        $query->orderBy($sort, $direction);

        $users = $query->paginate(10)->withQueryString();
        $roles = Role::all();

        // Ensure filters are always defined
        $filters = [
            'search' => $request->search ?? '',
            'sort' => $sort,
            'direction' => $direction,
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $filters
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Rules\Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(), // Auto verify for admin-created users
        ]);

        $user->assignRole($request->role);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => $request->password ? [Rules\Password::defaults()] : ['nullable'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->password) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $user->syncRoles([$request->role]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            throw ValidationException::withMessages([
                'error' => 'You cannot delete your own account.',
            ]);
        }
        // Prevent deletion if user owns a warehouse with products
        $ownsWarehouseWithProducts = $user->ownedWarehouses()->whereHas('inventoryItems', function($q) {
            $q->where('quantity', '>', 0);
        })->exists();
        if ($ownsWarehouseWithProducts) {
            throw ValidationException::withMessages([
                'error' => 'Cannot delete user: this user owns a warehouse that still has products.',
            ]);
        }
        // Prevent deletion if any owned warehouse has pending/in-transit purchase orders
        $ownsWarehouseWithPendingPOs = $user->ownedWarehouses()->whereHas('purchaseOrders', function($q) {
            $q->whereIn('status', ['pending', 'ordered', 'in_transit', 'partially_received']);
        })->exists();
        if ($ownsWarehouseWithPendingPOs) {
            throw ValidationException::withMessages([
                'error' => 'Cannot delete user: this user owns a warehouse with pending or in-transit purchase orders.',
            ]);
        }
        // Prevent deletion if any owned warehouse has pending/in-transit sales orders
        $ownsWarehouseWithPendingSOs = $user->ownedWarehouses()->whereHas('salesOrders', function($q) {
            $q->whereIn('status', ['pending', 'processing', 'shipped']);
        })->exists();
        if ($ownsWarehouseWithPendingSOs) {
            throw ValidationException::withMessages([
                'error' => 'Cannot delete user: this user owns a warehouse with pending or in-transit sales orders.',
            ]);
        }
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
