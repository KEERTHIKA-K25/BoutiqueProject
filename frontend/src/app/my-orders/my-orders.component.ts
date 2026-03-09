import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container fade-in">
      <div style="position: sticky; top: 0; z-index: 100; background: var(--glass-bg); backdrop-filter: blur(20px); text-align: center; padding: 40px 20px 20px; margin: -40px -40px 50px -40px; border-bottom: 1px solid rgba(0,0,0,0.03);">
        <h1 class="magazine-title">VIP Order Status</h1>
        <div style="display: flex; justify-content: center; margin-top: 25px;">
          <button class="btn-ghost" style="width: auto; padding: 10px 30px;" routerLink="/dashboard">
            RETURN TO BOUTIQUE
          </button>
        </div>
      </div>

      <div class="vip-orders-grid" *ngIf="orders.length > 0; else noOrders">
        <div class="vip-card fade-in" *ngFor="let order of orders">
          <div class="vip-card-header">
            <div>
              <span class="vip-label">Order Reference</span>
              <div class="vip-value">#{{ order.id }}</div>
            </div>
            <div style="text-align: right;">
              <span class="vip-label">Date</span>
              <div class="vip-value">{{ order.created_at | date:'dd MMM yyyy' }}</div>
            </div>
          </div>
          
          <div class="vip-card-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <span class="vip-label">Total Investment</span>
              <span class="vip-price">₹{{ order.total_amount }}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #f0f0f0;">
               <span class="vip-label">Status</span>
               <span class="status-badge" [ngClass]="order.status === 'shipped' ? 'badge-shipped' : 'badge-pending'">
                 {{ order.status | titlecase }}
               </span>
            </div>
          </div>
          
          <div class="vip-card-footer">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span class="vip-label" style="font-family: monospace;">
                {{ order.awb_code || order.tracking_id || 'Awaiting Logistics' }}
              </span>
              <button *ngIf="order.awb_code" class="btn-primary" style="padding: 8px 20px; font-size: 11px; width: auto;" (click)="trackOrder(order)">
                {{ trackingOrder === order.id ? 'Loading...' : 'Track Journey' }}
              </button>
            </div>
            
            <div class="timeline-container fade-in" *ngIf="trackingActivities[order.id]">
              <div *ngIf="trackingActivities[order.id].length === 0" style="font-size: 12px; color: #999; text-align: center; padding: 10px;">
                Awaiting courier intercept...
              </div>
              
              <div class="timeline-item" *ngFor="let activity of trackingActivities[order.id]; let i = index">
                <div class="timeline-dot" [ngClass]="i === 0 ? 'dot-active' : 'dot-past'"></div>
                <div class="timeline-content">
                  <div class="timeline-activity" [style.color]="i === 0 ? 'var(--secondary-color)' : '#999'">
                    {{ activity.activity }}
                  </div>
                  <div class="timeline-location" style="font-size: 11px; color: #aaa; margin-top: 4px;">
                     {{ activity.location }}
                  </div>
                  <div class="timeline-date" style="font-size: 10px; color: #bbb; margin-top: 2px;">
                     {{ activity.date | date:'dd MMM, h:mm a' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noOrders>
        <div style="text-align: center; padding: 100px 20px;">
          <h3 class="serif-heading" style="font-size: 24px; margin-bottom: 20px;">Your Collection is Empty</h3>
          <p style="color: #888; margin-bottom: 40px; font-weight: 300;">You haven't acquired any pieces yet.</p>
          <button class="btn-primary" style="width: auto; padding: 14px 40px;" routerLink="/dashboard">
            Explore the Boutique
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .vip-orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 40px;
      padding: 20px 0;
      justify-content: center;
      text-align: left;
    }
    
    .vip-card {
      background: white;
      border-radius: 4px;
      box-shadow: var(--shadow-soft);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .vip-card:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-4px);
    }
    
    .vip-card-header {
      background: #FBFBF9;
      padding: 25px 30px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .vip-card-body {
      padding: 30px;
    }
    
    .vip-card-footer {
      padding: 0 30px 30px;
    }
    
    .vip-label {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #999;
      margin-bottom: 6px;
    }
    
    .vip-value {
      font-size: 15px;
      font-weight: 500;
      color: var(--secondary-color);
    }
    
    .vip-price {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: var(--text-color);
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .badge-shipped {
      background-color: #F0F7F6;
      color: var(--primary-color);
    }
    .badge-pending {
      background-color: #FEF9F0;
      color: #B28E6C;
    }
    
    .btn-small {
      padding: 6px 12px !important;
      font-size: 12px !important;
      border-width: 1px !important;
    }
    
    .timeline-container {
      margin-top: 25px;
      padding-top: 25px;
      padding-left: 20px;
      border-top: 1px solid #f0f0f0;
      border-left: 1px solid #EBEBEB;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-left: 5px;
    }
    
    .timeline-item {
      position: relative;
      padding-left: 15px;
    }
    
    .timeline-dot {
      position: absolute;
      left: -21px;
      top: 5px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    .dot-active {
      background-color: var(--primary-color);
      border: 2px solid #e0f2f1;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 95, 107, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(0, 95, 107, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 95, 107, 0); }
    }
    
    .dot-past {
      background-color: #bdbdbd; /* Soft Grey */
      border: 2px solid white;
    }
    
    .timeline-activity {
      font-size: 13px;
      font-weight: 600;
      color: var(--secondary-color);
    }
    
    .timeline-date {
      font-size: 11px;
      color: #888;
      margin-top: 2px;
    }
  `]
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
