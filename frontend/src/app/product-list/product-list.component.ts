import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-grid" *ngIf="products.length > 0; else loadingState">
      <ng-container *ngIf="filteredProducts.length > 0; else noMatches">
        <div class="product-card" *ngFor="let product of filteredProducts"
             (click)="goToProduct(product.id)"
             role="button"
             [attr.aria-label]="'View ' + product.name">

          <div class="product-image-container">
            <img [src]="product.image_url" [alt]="product.name" class="product-image" loading="lazy">
            <div class="image-overlay">
              <span class="view-label">VIEW DETAILS</span>
            </div>
          </div>

          <div class="product-details">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">₹{{ product.price }}</div>
            <div class="card-cta">Tap to select size & order →</div>
          </div>
        </div>
      </ng-container>

      <ng-template #noMatches>
        <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
           <p style="color: #666; font-size: 14px; letter-spacing: 0.5px;">No matches found in our current collection.</p>
        </div>
      </ng-template>
    </div>

    <ng-template #loadingState>
      <div *ngIf="isLoading" style="text-align: center; padding: 50px; color: var(--accent-color);">
        <p>Loading New Arrivals...</p>
      </div>
      <div *ngIf="!isLoading && products.length === 0" style="text-align: center; padding: 50px;">
        <p>No products found.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-card {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 2px;
      overflow: hidden;
      background: white;
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.12);
    }
    .product-image-container {
      position: relative;
      overflow: hidden;
    }
    .product-image {
      width: 100%;
      display: block;
      object-fit: cover;
      aspect-ratio: 3/4;
      transition: transform 0.4s ease;
    }
    .product-card:hover .product-image {
      transform: scale(1.04);
    }
    /* Hover overlay */
    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(21,58,54,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .product-card:hover .image-overlay { opacity: 1; }
    .view-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      color: white;
      border: 1px solid rgba(255,255,255,0.7);
      padding: 8px 18px;
    }
    .product-details {
      padding: 18px 16px 20px;
    }
    .product-name {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 500;
      color: #153A36;
      margin: 0 0 6px 0;
    }
    .product-description {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      color: #888;
      margin: 0 0 10px 0;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .product-price {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: #D4AF37;
      margin-bottom: 8px;
    }
    .card-cta {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      color: #BBB;
      letter-spacing: 0.5px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router         = inject(Router);

  @Input() searchTerm: string = '';

  products: Product[] = [];
  isLoading = true;

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data) => { this.products = data; this.isLoading = false; },
      error: ()     => { this.isLoading = false; }
    });
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }
}
