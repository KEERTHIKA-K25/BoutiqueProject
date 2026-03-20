import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div style="display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; background-color: #FBFBF9; font-family: 'Montserrat', sans-serif;">
      
      <!-- L&L Sidebar -->
      <div style="background-color: #EADDD7; padding: 40px 20px; display: flex; flex-direction: column;">
        <div style="text-align: center; margin-bottom: 50px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #153A36; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">Luxe & Lace</h1>
          <div style="font-size: 9px; letter-spacing: 0.2em; color: #555; margin-top: 5px;">BOUTIQUE ADMIN</div>
        </div>

        <nav style="display: flex; flex-direction: column; gap: 10px;">
          <a class="sidebar-link active">Dashboard</a>
          <a class="sidebar-link" (click)="scrollToOrders()">Manage Orders</a>
          <a class="sidebar-link" (click)="goToReturns()">Return Orders</a>
          <a class="sidebar-link" (click)="showInventoryModal = true">Inventory</a>
        </nav>

        <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05);">
            <a style="cursor: pointer; font-size: 13px; font-weight: 500; color: #c94c4c; text-decoration: none;" (click)="logout()">Sign Out Securely</a>
        </div>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px; overflow-y: auto;">
        
        <!-- Header -->
        <div style="margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #153A36; margin: 0; font-weight: 400;">Key Stats</h2>
              <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Overview of your boutique operations.</p>
            </div>
        </div>

        <!-- 4 sleek cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px;">
            <div class="stat-card">
              <span class="stat-label">Total Orders</span>
              <div class="stat-value">{{ orders.length }}</div>
            </div>
            <div class="stat-card">
              <span class="stat-label">Pending Shipments</span>
              <div class="stat-value">{{ pendingCount }}</div>
            </div>
            <div class="stat-card">
              <span class="stat-label">Successful Syncs</span>
              <div class="stat-value">{{ syncedCount }}</div>
            </div>
            <div class="stat-card">
              <span class="stat-label">Revenue</span>
              <div class="stat-value" style="font-family: 'Playfair Display', serif;">₹{{ totalRevenue }}</div>
            </div>
        </div>

        <!-- The Management Table (Workhorse) -->
        <div id="orders-section" style="background: white; border: 1px solid #EBEBEB; border-radius: 4px; overflow: hidden;">
            <div style="padding: 20px 30px; border-bottom: 1px solid #EBEBEB; background: #FDFDFD;">
              <h3 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 20px; color: #153A36; font-weight: 500;">Recent Orders</h3>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left;" *ngIf="orders.length > 0; else noOrders">
              <thead>
                <tr style="background-color: #FCFBF9; border-bottom: 1px solid #EBEBEB;">
                  <th style="padding: 15px 30px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #153A36; letter-spacing: 1px;">Order #</th>
                  <th style="padding: 15px 30px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #153A36; letter-spacing: 1px;">Date</th>
                  <th style="padding: 15px 30px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #153A36; letter-spacing: 1px;">Total</th>
                  <th style="padding: 15px 30px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #153A36; letter-spacing: 1px;">Status</th>
                  <th style="padding: 15px 30px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #153A36; letter-spacing: 1px;">Logistics / AWB</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of orders" style="border-bottom: 1px solid #F0F0F0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#FCFBF9'" onmouseout="this.style.backgroundColor='transparent'">
                  <td style="padding: 20px 30px; font-weight: 500; font-size: 13px; color: #222;">#{{ order.id }}</td>
                  <td style="padding: 20px 30px; font-size: 13px; color: #555;">{{ order.created_at | date:'mediumDate' }}</td>
                  <td style="padding: 20px 30px; font-size: 13px; font-weight: 500; color: #222;">₹{{ order.total_amount }}</td>
                  
                  <td style="padding: 20px 30px;">
                    <select [(ngModel)]="order.status" (change)="saveStatus(order)" style="padding: 6px 12px; border: 1px solid #DEDEDE; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 11px; background: white; outline: none; cursor: pointer; text-transform: uppercase;"
                            [disabled]="order.status === 'delivered'">
                      <option value="pending" [disabled]="order.status === 'shipped' || order.status === 'delivered'">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>

                  <td style="padding: 20px 30px;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                       <input type="text" [(ngModel)]="order.new_awb" placeholder="Enter AWB" 
                              style="width: 140px; padding: 8px 12px; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 12px; outline: none; transition: border-color 0.3s;"
                              [style.border]="(order.awb_code || order.status === 'delivered') ? '1px solid #E0E0E0' : '1px solid #DEDEDE'"
                              [style.background-color]="(order.awb_code || order.status === 'delivered') ? '#F2F2F2' : 'white'"
                              [style.color]="(order.awb_code || order.status === 'delivered') ? '#555555' : '#222222'"
                              [style.pointer-events]="(order.awb_code || order.status === 'delivered') ? 'none' : 'auto'"
                              [style.user-select]="(order.awb_code || order.status === 'delivered') ? 'none' : 'auto'"
                              [attr.tabindex]="(order.awb_code || order.status === 'delivered') ? -1 : 0"
                              [disabled]="!!order.awb_code || order.status === 'delivered'"
                              [readonly]="!!order.awb_code || order.status === 'delivered'"
                              [value]="order.awb_code ? order.awb_code : ''"
                              onfocus="if(!this.disabled) this.style.borderColor='#153A36'" 
                              onblur="if(!this.disabled) this.style.borderColor='#DEDEDE'">
                       
                       <button style="padding: 8px 15px; border: none; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;"
                               [style.background]="order.awb_code ? '#EBEBEB' : '#153A36'"
                               [style.color]="order.awb_code ? '#888' : 'white'"
                               [style.cursor]="(order.awb_code || !order.new_awb) ? 'not-allowed' : 'pointer'"
                               [disabled]="!order.new_awb || order.awb_code || order.syncing" 
                               (click)="syncShiprocket(order)">
                         {{ order.awb_code ? 'SYNCED' : (order.syncing ? 'SYNCING...' : 'GENERATE TRACKING') }}
                       </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noOrders>
              <div style="padding: 60px; text-align: center; color: #888; font-size: 14px;">
                No orders pending fulfillment.
              </div>
            </ng-template>
        </div>

      </div>
    </div>

    <!-- Inventory Modal -->
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000;" *ngIf="showInventoryModal">
      <div style="background: white; padding: 40px; border-radius: 4px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 100%; max-width: 500px; position: relative;">
        
        <button style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: #888; cursor: pointer;" (click)="closeModal()">&times;</button>
        
        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #153A36; margin: 0 0 30px 0; text-align: center;">Add New Product</h2>
        
        <form (ngSubmit)="saveProduct()">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px; margin-bottom: 8px;">Product Name</label>
            <input type="text" [(ngModel)]="newProduct.name" name="name" required style="width: 100%; padding: 12px; border: 1px solid #EBEBEB; border-radius: 2px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; outline: none;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px; margin-bottom: 8px;">Description</label>
            <textarea [(ngModel)]="newProduct.description" name="description" required rows="3" style="width: 100%; padding: 12px; border: 1px solid #EBEBEB; border-radius: 2px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; outline: none; resize: vertical;"></textarea>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px; margin-bottom: 8px;">Price (₹)</label>
            <input type="number" [(ngModel)]="newProduct.price" name="price" required style="width: 100%; padding: 12px; border: 1px solid #EBEBEB; border-radius: 2px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; outline: none;">
          </div>

          <div style="margin-bottom: 30px;">
            <label style="display: block; font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px; margin-bottom: 8px;">Image URL</label>
            <input type="url" [(ngModel)]="newProduct.image_url" name="image_url" required style="width: 100%; padding: 12px; border: 1px solid #EBEBEB; border-radius: 2px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; outline: none;">
          </div>

          <button type="submit" [disabled]="isSavingProduct" style="width: 100%; padding: 14px; background-color: #153A36; color: white; border: none; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer;">
            {{ isSavingProduct ? 'SAVING...' : 'SAVE PRODUCT' }}
          </button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .sidebar-link {
        display: block;
        padding: 12px 20px;
        color: #153A36;
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        border-radius: 4px;
        transition: background-color 0.2s;
        cursor: pointer;
    }
    .sidebar-link:hover {
        background-color: rgba(255,255,255,0.4);
    }
    .sidebar-link.active {
        background-color: white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.02);
    }
    
    .stat-card {
        background: white;
        padding: 25px;
        border-radius: 4px;
        border: 1px solid #EBEBEB;
        box-shadow: 0 4px 10px rgba(0,0,0,0.02);
    }
    .stat-label {
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        color: #888;
        letter-spacing: 1px;
        margin-bottom: 10px;
    }
    .stat-value {
        font-size: 28px;
        font-weight: 500;
        color: #153A36;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
    orders: any[] = [];

    pendingCount = 0;
    syncedCount = 0;
    totalRevenue = 0;

    showInventoryModal = false;
    isSavingProduct = false;
    newProduct = {
      name: '',
      description: '',
      price: null as number | null,
      image_url: ''
    };

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    ngOnInit() {
        this.fetchOrders();

        this.route.queryParams.subscribe(params => {
            if (params['tab'] === 'inventory') {
                this.showInventoryModal = true;
            } else if (params['tab'] === 'orders') {
                setTimeout(() => this.scrollToOrders(), 100);
            }
        });
    }

    fetchOrders() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        this.http.get<any[]>(`${environment.apiUrl}/admin/orders`, { headers }).subscribe(res => {
            this.orders = res;
            this.calculateStats();
        });
    }

    goToReturns() {
        this.router.navigate(['/admin/returns']);
    }

    calculateStats() {
        this.pendingCount = this.orders.filter(o => o.status === 'pending').length;
        this.syncedCount = this.orders.filter(o => o.awb_code).length;
        this.totalRevenue = this.orders.reduce((sum, current) => sum + parseFloat(current.total_amount || 0), 0);
    }

    saveStatus(order: any) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        this.http.put(`${environment.apiUrl}/admin/orders/${order.id}/status`, { status: order.status }, { headers })
            .subscribe({
                next: () => {
                    this.calculateStats();
                },
                error: () => {
                   this.toastService.show('⚠️ Failed to update order status. Please try again.');
                }
            });
    }

    syncShiprocket(order: any) {
        const code = order.new_awb || order.awb_code;
        if (!code) return;

        order.syncing = true;
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        this.http.post(`${environment.apiUrl}/admin/orders/${order.id}/awb`, { awb_code: code }, { headers })
            .subscribe({
                next: () => {
                    order.awb_code = code;
                    order.status = 'shipped';
                    order.syncing = false;
                    this.calculateStats();
                    this.toastService.show('✨ Synced securely with Shiprocket Logistics.');
                },
                error: () => {
                    order.syncing = false;
                    this.toastService.show('⚠️ Shiprocket Sync Failed. Please check the AWB code and try again.');
                }
            });
    }

    logout() {
        this.authService.adminLogout().subscribe({
            next: () => this.router.navigate(['/admin/login']),
            error: () => this.router.navigate(['/admin/login'])
        });
    }

    scrollToOrders() {
        document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    closeModal() {
        this.showInventoryModal = false;
        this.newProduct = { name: '', description: '', price: null, image_url: '' };
    }

    saveProduct() {
        this.isSavingProduct = true;
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);

        this.http.post(`${environment.apiUrl}/admin/products`, this.newProduct, { headers })
            .subscribe({
                next: (res) => {
                    this.isSavingProduct = false;
                    this.closeModal();
                    this.toastService.show('✨ Product saved successfully — now live in boutique!');
                },
                error: (err) => {
                    this.isSavingProduct = false;
                    this.toastService.show('⚠️ Failed to add product. Please check all fields and try again.');
                }
            });
    }
}
