<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Hand-painted Organza Saree',
                'description' => 'Exquisite hand-painted floral motifs on pure organza silk.',
                'price' => 12500.00,
                'stock' => 10,
                'image_url' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'name' => 'Zardosi Work Lehenga',
                'description' => 'Bridal lehenga with heavy zardosi and sequence embroidery.',
                'price' => 45000.00,
                'stock' => 5,
                'image_url' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'name' => 'Banarasi Silk Kurta Set',
                'description' => 'Classic banarasi woven kurta paired with a matching dupatta.',
                'price' => 8500.00,
                'stock' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1583391733959-b1510768018d?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'name' => 'Embroidered Anarkali Suit',
                'description' => 'Floor-length anarkali suit featuring delicate threadwork and a sheer dupatta.',
                'price' => 15000.00,
                'stock' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1595777648316-2fd74fe8c3ae?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'name' => 'Velvet Sherwani',
                'description' => 'Premium velvet sherwani for men, complete with intricate gold embroidery.',
                'price' => 32000.00,
                'stock' => 4,
                'image_url' => 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'name' => 'Chanderi Silk Dupatta',
                'description' => 'Lightweight chanderi silk dupatta with subtle zari borders.',
                'price' => 3500.00,
                'stock' => 20,
                'image_url' => 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=800'
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
