import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProductListComponent } from '../product-list/product-list.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ProductListComponent, RouterLink, FormsModule, CommonModule],
  template: `
    <div class="dashboard-container fade-in" style="padding-top: 0;">
      <div style="border-top: 5px solid #C9A86A; background: var(--glass-bg); display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; border-bottom: 1px solid #EBEBEB;">
        <div style="flex: 1; display: flex; align-items: center; gap: 25px;">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" [routerLink]="['/dashboard']">Shop</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" [routerLink]="['/new-arrivals']">New Arrivals</a>
        </div>
        
        <div style="flex: 1; text-align: center;">
          <h1 class="magazine-title" style="font-size: 26px; color: var(--secondary-color); margin: 0; letter-spacing: 0.08em;">LUXE & LACE</h1>
          <div style="font-size: 11px; letter-spacing: 0.3em; color: #555; margin-top: 5px;">BOUTIQUE</div>
        </div>
        
        <div style="flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 20px;">
          <input type="text" placeholder="Search..." [(ngModel)]="searchTerm" style="border: none; border-bottom: 1px solid #ccc; padding: 4px 6px; font-family: 'Montserrat', sans-serif; font-size: 12px; outline: none; background: transparent; width: 140px; color: var(--text-color); transition: border-color 0.3s;" onfocus="this.style.borderBottomColor='var(--primary-color)'" onblur="this.style.borderBottomColor='#ccc'">
          
          @if (isLoggedIn) {
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" [routerLink]="['/my-orders']">Account</a>
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" tabindex="0" (click)="logout()">Sign Out</a>
          } @else {
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" [routerLink]="['/login']">Login</a>
            <span style="color: #ccc;">|</span>
            <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" [routerLink]="['/register']">Register</a>
          }
        </div>
      </div>

      <div style="position: relative; width: 100vw; height: 60vh; margin-bottom: 50px; overflow: hidden; background-color: var(--accent-color);">
        <ng-container *ngFor="let img of heroImages; let i = index">
          <div class="hero-slide" [class.active]="i === currentSlideIndex" [style.background-image]="'url(' + img + ')'"></div>
        </ng-container>

        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)); z-index: 1;"></div>

        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; z-index: 2;">
          <div style="margin-left: 10%; max-width: 600px;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 400; color: white; margin-top: 0; line-height: 1.1;">ELEGANT AUTUMN<br/>ARRIVALS</h2>
            <button class="btn-hero-ghost" (click)="scrollToCollection()">SHOP THE COLLECTION</button>
          </div>
        </div>
      </div>

      <div id="collection-grid" style="width: 90%; margin: 0 auto; padding-bottom: 60px;">
        <app-product-list [searchTerm]="searchTerm"></app-product-list>
      </div>
    </div>
  `,
  styles: [`
    .hero-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 60vh;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 1.5s ease-in-out;
      z-index: 0;
    }
    .hero-slide.active {
      opacity: 1;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  searchTerm = '';
  
  heroImages: string[] = [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop'
  ];
  currentSlideIndex = 0;
  private slideInterval: any;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.slideInterval = setInterval(() => {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroImages.length;
      }, 5000);
    }
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

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
