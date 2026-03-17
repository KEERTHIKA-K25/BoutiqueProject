import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductListComponent } from '../product-list/product-list.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ProductListComponent, RouterLink, FormsModule],
  template: `
    <div class="dashboard-container fade-in" style="padding-top: 0;">
      <div style="border-top: 5px solid #C9A86A; background: var(--glass-bg); display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; margin: 0 -40px 0 -40px; border-bottom: 1px solid #EBEBEB;">
        <div style="flex: 1; display: flex; align-items: center; gap: 25px;">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/dashboard">Shop</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/new-arrivals">New Arrivals</a>
        </div>
        
        <div style="flex: 1; text-align: center;">
          <h1 class="magazine-title" style="font-size: 26px; color: var(--secondary-color); margin: 0; letter-spacing: 0.08em;">LUXE & LACE</h1>
          <div style="font-size: 11px; letter-spacing: 0.3em; color: #555; margin-top: 5px;">BOUTIQUE</div>
        </div>
        
        <div style="flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 20px;">
          <input type="text" placeholder="Search..." [(ngModel)]="searchTerm" style="border: none; border-bottom: 1px solid #ccc; padding: 4px 6px; font-family: 'Montserrat', sans-serif; font-size: 12px; outline: none; background: transparent; width: 140px; color: var(--text-color); transition: border-color 0.3s;" onfocus="this.style.borderBottomColor='var(--primary-color)'" onblur="this.style.borderBottomColor='#ccc'">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/my-orders">Account</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" (click)="logout()">Sign Out</a>
        </div>
      </div>

      <div style="background-color: var(--accent-color); padding: 80px 40px; margin: 0 -40px 40px -40px; text-align: left;">
        <div style="max-width: 500px; padding-left: 10%;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 46px; font-weight: 400; color: var(--secondary-color); margin-top: 0; line-height: 1.2;">ELEGANT AUTUMN<br/>ARRIVALS</h2>
          <button class="btn-primary" style="width: auto; padding: 14px 30px; margin-top: 15px;" (click)="scrollToCollection()">SHOP THE COLLECTION</button>
        </div>
      </div>

      <div id="collection-grid">
        <app-product-list [searchTerm]="searchTerm"></app-product-list>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  searchTerm = '';

  scrollToCollection() {
    document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']) // Still navigate back to login
    });
  }
}
