import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ProductListComponent } from '../product-list/product-list.component';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [ProductListComponent, RouterLink, FormsModule],
  template: `
    <div class="dashboard-container fade-in" style="padding-top: 0;">
      <div style="border-top: 5px solid #C9A86A; background: var(--glass-bg); display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; border-bottom: 1px solid #EBEBEB;">
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
          @if (isLoggedIn) {
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/my-orders">Account</a>
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" (click)="logout()">Sign Out</a>
          } @else {
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/login">Login</a>
            <span style="color: #ccc;">|</span>
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/register">Register</a>
          }
        </div>
      </div>

      <div style="padding: 40px 8% 80px 8%;">
        <div style="text-align: left; margin-bottom: 30px;">
           <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: var(--secondary-color); margin: 0; letter-spacing: 0.05em;">NEW ARRIVALS</h2>
        </div>

        <div>
           <app-product-list [searchTerm]="searchTerm"></app-product-list>
        </div>
      </div>
    </div>
  `
})
export class NewArrivalsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  searchTerm = '';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
