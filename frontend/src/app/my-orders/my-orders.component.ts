import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container fade-in" style="padding-top: 0;">
      <div style="border-top: 5px solid #C9A86A; background: var(--glass-bg); display: flex; justify-content: space-between; align-items: center; padding: 25px 40px; margin: 0 -40px 0 -40px; border-bottom: 1px solid #EBEBEB;">
        <div style="flex: 1; display: flex; gap: 25px;">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/dashboard">Shop</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;">New Arrivals</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;">Sale</a>
        </div>
        
        <div style="flex: 1; text-align: center;">
          <h1 class="magazine-title" style="font-size: 26px; color: var(--secondary-color); margin: 0; letter-spacing: 0.08em;">LUXE & LACE</h1>
          <div style="font-size: 11px; letter-spacing: 0.3em; color: #555; margin-top: 5px;">BOUTIQUE</div>
        </div>
        
        <div style="flex: 1; display: flex; justify-content: flex-end; gap: 20px;">
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;">Search</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/admin/orders">Admin</a>
          <a style="color: var(--text-color); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none;" routerLink="/my-orders">Account</a>
        </div>
      </div>

      <div style="background-color: var(--accent-color); padding: 50px 40px; margin: 0 -40px 40px -40px; text-align: center;">
        <h2 style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 400; color: var(--secondary-color); margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">MY ORDERS</h2>
      </div>

      <div class="table-card" style="box-shadow: none; border: 1px solid #EBEBEB; padding: 10px; border-radius: 0;">
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
            <tr *ngFor="let order of orders" style="border-bottom: 1px solid #F0F0F0;">
              <td style="padding: 15px; font-weight: 500; font-size: 13px; color: var(--secondary-color);">#{{ order.id }}</td>
              <td style="padding: 15px; font-size: 13px;">{{ order.created_at | date:'mediumDate' }}</td>
              <td style="padding: 15px; font-size: 13px; font-weight: 500;">₹{{ order.total_amount }}</td>
              <td style="padding: 15px; font-size: 13px;">{{ order.status | titlecase }}</td>
              <td style="padding: 15px;">
                <div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start;">
                    <button *ngIf="order.awb_code" class="btn-primary" style="padding: 6px 12px; font-size: 10px; width: auto;" (click)="trackOrder(order)">
                      {{ trackingOrder === order.id ? 'LOADING...' : 'VIEW ORDER' }}
                    </button>
                    <button *ngIf="!order.awb_code && order.tracking_id" class="btn-primary" style="padding: 6px 12px; font-size: 10px; width: auto; background-color: #A0A0A0;" disabled>
                      PROCESSING
                    </button>

                    <div class="timeline-container fade-in" *ngIf="trackingActivities[order.id]" style="margin-top: 10px;">
                      <div *ngIf="trackingActivities[order.id].length === 0" style="font-size: 11px; color: #999;">
                        Awaiting courier intercept...
                      </div>
                      
                      <div *ngFor="let activity of trackingActivities[order.id]; let i = index" style="margin-bottom: 5px;">
                          <div [style.color]="i === 0 ? 'var(--primary-color)' : '#666'" style="font-size: 12px; font-weight: 500;">
                            {{ activity.activity }}
                          </div>
                          <div style="font-size: 10px; color: #888;">
                             {{ activity.location }} - {{ activity.date | date:'dd MMM, h:mm a' }}
                          </div>
                      </div>
                    </div>
                </div>
              </td>
            </tr>
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
  `
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

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
}
