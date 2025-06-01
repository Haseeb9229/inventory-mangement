<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            'ABC Suppliers',
            'XYZ Corporation',
            'Global Imports',
            'Local Distributors',
            'Tech Suppliers',
            'Fashion Wholesale',
            'Food Distributors',
            'Health Products Inc'
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create([
                'name' => $supplier,
                'contact_name' => 'John Doe',
                'email' => strtolower(str_replace(' ', '', $supplier)) . '@example.com',
                'phone' => '1234567890',
                'address' => '123 Supplier St'
            ]);
        }
    }
}
