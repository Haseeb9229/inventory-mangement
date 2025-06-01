<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Electronics',
            'Clothing',
            'Books',
            'Home & Garden',
            'Sports',
            'Toys',
            'Food',
            'Health',
            'Beauty'
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}
