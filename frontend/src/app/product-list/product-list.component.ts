import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-grid" *ngIf="products.length > 0; else loadingState">
      <ng-container *ngIf="filteredProducts.length > 0; else noMatches">
        <div class="product-card" *ngFor="let product of filteredProducts">
          <div class="product-image-container">
            <img [src]="product.image_url" [alt]="product.name" class="product-image" loading="lazy">
          </div>
          
          <div class="product-details">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">₹{{ product.price }}</div>
            
            <button class="btn-primary" (click)="buyNow(product.id)" [disabled]="isSubmitting">
              {{ isSubmitting && currentProductId === product.id ? 'PROCESSING...' : 'BUY NOW' }}
            </button>
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

    <!-- Toast Notification -->
    <div class="toast-notification" *ngIf="successMessage" [class.show]="toastVisible">
      <div class="toast-content">
        <h4>✨ Order Placed!</h4>
        <p>{{ successMessage }}</p>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  @Input() searchTerm: string = '';

  products: Product[] = [];
  isLoading = true;
  isSubmitting = false;
  currentProductId: number | null = null;

  successMessage = '';
  toastVisible = false;

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.isLoading = false;
      }
    });
  }

  buyNow(productId: number) {
    this.isSubmitting = true;
    this.currentProductId = productId;

    this.orderService.placeOrder(productId).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.currentProductId = null;
        this.showToast(`✨ Order Successfully Created! Tracking will be available once dispatched by Admin.`);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.currentProductId = null;
        alert('Failed to place order.');
      }
    });
  }

  showToast(message: string) {
    this.successMessage = message;

    // Slight delay to allow DOM to render before animating
    setTimeout(() => {
      this.toastVisible = true;
    }, 10);

    // Hide toast after 5 seconds
    setTimeout(() => {
      this.toastVisible = false;
      setTimeout(() => {
        this.successMessage = '';
      }, 300); // 300px transition time
    }, 5000);
  }
}
