import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h1 style="color: var(--secondary-color); font-weight: 600;">Admin Orders Portal</h1>
        <button class="btn-ghost" style="width: auto; padding: 10px 20px;" routerLink="/dashboard">
          Back
        </button>
      </div>

      <div class="table-card">
        <table class="premium-table" *ngIf="orders.length > 0; else noOrders">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status / Tracking</th>
              <th>Assign AWB</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td style="font-weight: 600;">#{{ order.id }}</td>
              <td>{{ order.created_at | date:'mediumDate' }}</td>
              <td style="font-weight: 600; color: var(--secondary-color);">₹{{ order.total_amount }}</td>
              <td>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                  <span class="status-badge" [ngClass]="order.status === 'shipped' ? 'badge-shipped' : 'badge-pending'">
                    {{ order.status | titlecase }}
                  </span>
                  <span style="font-family: monospace; color: #666; font-size: 13px;" *ngIf="order.awb_code">
                    AWB: {{ order.awb_code }}
                  </span>
                </div>
              </td>
              <td>
                <div *ngIf="order.status !== 'shipped' || !order.awb_code" style="display: flex; gap: 10px;">
                  <input type="text" [(ngModel)]="order.new_awb" placeholder="Enter AWB Code" 
                         style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-family: 'Outfit';">
                  <button class="btn-ghost" style="padding: 8px 15px; background: var(--accent-color); color: white;" 
                          (click)="saveAwb(order)" [disabled]="!order.new_awb">
                    Save AWB
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noOrders>
        <div style="text-align: center; padding: 50px;">
          <p>No orders to manage.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .table-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .premium-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Outfit', sans-serif;
    }
    .premium-table th {
      background-color: #f8f6f2; /* Light beige */
      color: var(--accent-color);
      text-transform: uppercase;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      padding: 20px;
      text-align: left;
      border-bottom: 2px solid #e8e3dc;
    }
    .premium-table td {
      padding: 20px;
      border-bottom: 1px solid #f0ede8;
      color: #555;
      font-size: 15px;
      vertical-align: middle;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-shipped { background-color: #e8f3ee; color: #4a8f70; }
    .badge-pending { background-color: #fdf5e6; color: #bfa36c; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    const token = localStorage.getItem('admin_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${environment.apiUrl}/admin/orders`, { headers }).subscribe(res => {
      this.orders = res;
    });
  }

  saveAwb(order: any) {
    const token = localStorage.getItem('admin_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${environment.apiUrl}/admin/orders/${order.id}/awb`, { awb_code: order.new_awb }, { headers })
      .subscribe(() => {
        order.awb_code = order.new_awb;
        order.status = 'shipped';
        alert('AWB Saved & Order Shipped');
      });
  }
}
