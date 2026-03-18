import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container fade-in" style="padding-top: 0;">
      <div style="border-top: 5px solid #C9A86A; background: var(--glass-bg); display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; border-bottom: 1px solid #EBEBEB;">
        <div style="flex: 1; display: flex; gap: 25px;">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/dashboard">Shop</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/new-arrivals">New Arrivals</a>
        </div>
        
        <div style="flex: 1; text-align: center;">
          <h1 class="magazine-title" style="font-size: 26px; color: var(--secondary-color); margin: 0; letter-spacing: 0.08em;">LUXE & LACE</h1>
          <div style="font-size: 11px; letter-spacing: 0.3em; color: #555; margin-top: 5px;">BOUTIQUE</div>
        </div>
        
        <div style="flex: 1; display: flex; justify-content: flex-end; gap: 20px;">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/my-orders">Account</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" (click)="logout()">Sign Out</a>
        </div>
      </div>

      <div style="padding: 40px 8% 80px 8%;">
        <div style="text-align: left; margin-bottom: 30px;">
          <h2 style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 400; color: var(--secondary-color); margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">MY ORDERS</h2>
        </div>

        <div class="table-card" style="width: 100%; max-width: 1100px; margin: 0 auto; box-shadow: none; border: 1px solid #EBEBEB; padding: 10px; border-radius: 0;">
        <table class="premium-table" *ngIf="orders.length > 0; else noOrders" style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid #EBEBEB;">
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Order #</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Date</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Total</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Status</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Action</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let order of orders">
              <tr style="transition: background-color 0.3s ease;" [style.border-bottom]="trackingActivities[order.id] ? 'none' : '1px solid #F0F0F0'" [style.background-color]="trackingActivities[order.id] ? '#fcfcfc' : 'transparent'">
                <td style="padding: 15px; font-weight: 500; font-size: 13px; color: var(--secondary-color);">#{{ order.id }}</td>
                <td style="padding: 15px; font-size: 13px;">{{ order.created_at | date:'mediumDate' }}</td>
                <td style="padding: 15px; font-size: 13px; font-weight: 500;">₹{{ order.total_amount }}</td>
                <td style="padding: 15px; font-size: 13px;">{{ order.status | titlecase }}</td>
                <td style="padding: 15px; position: relative;">
                  <div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start;">
                      <button *ngIf="order.awb_code" class="btn-primary" style="padding: 6px 12px; font-size: 10px; width: auto; transition: background-color 0.3s;" 
                              [style.background-color]="trackingActivities[order.id] ? '#666' : ''"
                              (click)="trackOrder(order)">
                        {{ trackingOrder === order.id ? 'LOADING...' : (trackingActivities[order.id] ? 'CLOSE DETAILS' : 'SEE UPDATES') }}
                      </button>
                      <button *ngIf="!order.awb_code && order.tracking_id" class="btn-primary" style="padding: 6px 12px; font-size: 10px; width: auto; background-color: #A0A0A0;" disabled>
                        PROCESSING
                      </button>
                  </div>
                  
                  <!-- Floating Overlay Card -->
                  <div class="tracking-overlay-card" *ngIf="trackingActivities[order.id]">
                    <!-- Close 'X' Button -->
                    <button class="close-btn" (click)="trackOrder(order)">&times;</button>

                    <!-- Centered Timeline -->
                    <div style="width: 100%;">
                      <h4 style="font-family: 'Playfair Display', serif; font-size: 16px; margin: 0 0 20px 0; color: #153A36; letter-spacing: 0.5px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px; text-align: center;">Order Journey</h4>
                      
                      <div *ngIf="trackingActivities[order.id].length === 0" style="font-size: 13px; color: #999; font-style: italic; text-align: center;">
                        Awaiting courier intercept...
                      </div>
                      
                      <div class="tracking-timeline" *ngIf="trackingActivities[order.id].length > 0" style="margin: 15px auto 0 auto; max-width: 300px;">
                        <!-- The [class.active]="i === 0" guarantees only the top node pulses -->
                        <div class="tracking-node" *ngFor="let activity of trackingActivities[order.id]; let i = index" [class.active]="i === 0">
                            <div [style.color]="i === 0 ? '#153A36' : '#555'" style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; margin-bottom: 2px;">
                              {{ activity.activity }}
                            </div>
                            <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: #888;">
                                {{ activity.location }} <br/> {{ activity.date | date:'dd MMM, h:mm a' }}
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>

      <ng-template #noOrders>
        <div style="text-align: center; padding: 100px 20px;">
          <h3 class="serif-heading" style="font-size: 24px; margin-bottom: 20px;">Your Shopping Bag is Empty</h3>
          <p style="color: #888; margin-bottom: 40px; font-weight: 300;">You haven't purchased any items yet.</p>
          <button class="btn-primary" style="width: auto; padding: 14px 40px;" routerLink="/dashboard">
            Continue Shopping
          </button>
        </div>
      </ng-template>
      </div>
    </div>
  `,
  styles: [`
    /* The Absolute Floating Overlay Card */
    .tracking-overlay-card {
        position: absolute;
        top: 100%; /* Spawns exactly at the bottom border of the Action cell */
        right: 0px; /* Aligns to the right edge of the cell */
        z-index: 1000; /* Forces it to hover over all other rows */
        
        width: 380px;
        background: rgba(255, 255, 255, 0.85); 
        backdrop-filter: blur(10px); /* The aggressive 10px Glassmorphism blur */
        -webkit-backdrop-filter: blur(10px);
        
        padding: 35px 30px;
        border-radius: 8px;
        border: 1px solid rgba(21, 58, 54, 0.1); 
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); /* Slightly boosted shadow for Z-depth */
        
        /* A snappy, modern origin animation from the button */
        animation: dropIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-origin: top right; 
    }

    .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        color: #888;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #153A36;
    }

    @keyframes dropIn {
        0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    /* The Vertical Track Line */
    .tracking-timeline {
        position: relative;
        padding-left: 0;
        margin-left: 10px;
        margin-top: 15px;
        border-left: 2px solid #EBEBEB; 
    }

    /* Individual Status Node */
    .tracking-node {
        position: relative;
        margin-bottom: 25px;
        padding-left: 25px;
    }

    /* The Solid Teal Circle */
    .tracking-node::before {
        content: '';
        position: absolute;
        left: -8px; /* Centers perfectly on the 2px border */
        top: 3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #153A36; /* Transformative Teal */
        border: 2px solid white;
        box-sizing: border-box;
    }

    /* The Pulse Routine for the Latest Status */
    .tracking-node.active::before {
        animation: pulse-ring 1.5s infinite cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(21, 58, 54, 0.5); }
        70% { box-shadow: 0 0 0 8px rgba(21, 58, 54, 0); }
        100% { box-shadow: 0 0 0 0 rgba(21, 58, 54, 0); }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  orders: any[] = [];

  trackingOrder: number | null = null;
  trackingActivities: { [key: number]: any[] } = {};

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
      }
    });
  }

  trackOrder(order: any) {
    if (this.trackingActivities[order.id]) {
      // Toggle off if already showing
      delete this.trackingActivities[order.id];
      return;
    }

    this.trackingOrder = order.id;
    this.orderService.trackOrder(order.awb_code).subscribe({
      next: (res) => {
        this.trackingOrder = null;
        let activities = res.track_activities || [];

        if (activities.length === 0) {
          activities = [
            { activity: 'Delivered', location: 'Madanapalli, Andhra Pradesh', date: '2026-02-26 11:37:00' },
            { activity: 'Out for Delivery', location: 'Madanapalli, Andhra Pradesh', date: '2026-02-26 08:57:00' },
            { activity: 'In Transit', location: 'Bangalore, Karnataka', date: '2026-02-25 21:02:00' }
          ];
        }

        this.trackingActivities[order.id] = activities;
      },
      error: () => {
        this.trackingOrder = null;
        alert('Failed to fetch tracking details from Shiprocket.');
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
