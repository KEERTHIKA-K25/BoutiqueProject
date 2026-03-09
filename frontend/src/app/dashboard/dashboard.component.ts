import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductListComponent } from '../product-list/product-list.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ProductListComponent, RouterLink],
  template: `
    <div class="dashboard-container fade-in">
      <div style="position: sticky; top: 0; z-index: 100; background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); text-align: center; padding: 40px 20px 20px; margin: -40px -40px 50px -40px; border-bottom: 1px solid rgba(0,0,0,0.03);">
        <h1 class="magazine-title">Boutique Dashboard</h1>
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 25px;">
          <button class="btn-ghost" style="width: auto; padding: 10px 24px; font-size: 11px;" routerLink="/admin/orders">
            Admin
          </button>
          <button class="btn-ghost" style="width: auto; padding: 10px 24px; font-size: 11px;" routerLink="/my-orders">
            My Orders
          </button>
          <button class="btn-ghost" style="width: auto; padding: 10px 24px; font-size: 11px; color: var(--error-color); border-color: var(--error-color);" (click)="logout()">
            Sign Out
          </button>
        </div>
      </div>

      <app-product-list></app-product-list>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']) // Still navigate back to login
    });
  }
}
