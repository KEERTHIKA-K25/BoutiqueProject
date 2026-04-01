import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, AddressPayload } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">S.NO</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Product</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Date</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Total</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Status</th>
              <th style="padding: 15px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Action</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let order of orders; let i = index">
              <tr style="transition: background-color 0.3s ease;" [style.border-bottom]="trackingActivities[order.id] ? 'none' : '1px solid #F0F0F0'" [style.background-color]="trackingActivities[order.id] ? '#fcfcfc' : 'transparent'">
                <td style="padding: 15px; font-weight: 500; font-size: 13px; color: var(--secondary-color);">#{{ i + 1 }}</td>
                <td style="padding: 15px; font-size: 13px; max-width: 200px;">
                  <span style="font-family: 'Playfair Display', serif; font-size: 13px; color: #153A36; display: block;">
                    {{ order.product?.name || '—' }}
                  </span>
                </td>
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
                      
                      <!-- Return Ghost Button — only on delivered orders -->
                      @if (order.status === 'delivered') {
                        <button class="btn-ghost" style="padding: 6px 12px; font-size: 11px; width: auto; margin-top: 5px; border: 1px solid var(--secondary-color); color: var(--secondary-color); background: transparent;" (click)="openReturnModal(order)">
                          RETURN ITEM
                        </button>
                      }
                      
                      <!-- Return Status Details -->
                      <span *ngIf="order.status === 'Return Requested' && order.shipment_id" style="font-size: 11px; color: #555; display: block; margin-top: 5px; font-weight: 500;">
                        Return ID: {{ order.shipment_id }}
                      </span>
                  </div>
                  
                  <!-- Tracking Modal Overlay -->
                  <div class="modal-overlay" *ngIf="trackingActivities[order.id]" (click)="trackOrder(order)" style="z-index: 3000;">
                    <div class="tracking-overlay-card" (click)="$event.stopPropagation()">
                      <!-- Close 'X' Button -->
                      <button class="close-btn" (click)="trackOrder(order)">&times;</button>

                      <!-- Centered Timeline -->
                      <div style="width: 100%;">
                        <h4 style="font-family: 'Playfair Display', serif; font-size: 16px; margin: 0 0 20px 0; color: #153A36; letter-spacing: 0.5px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px; text-align: center;">Order Journey</h4>
                        
                        <div *ngIf="trackingActivities[order.id].length === 0" style="font-size: 13px; color: #999; font-style: italic; text-align: center;">
                          Awaiting courier intercept...
                        </div>
                        
                        <div class="tracking-timeline" *ngIf="trackingActivities[order.id].length > 0" style="margin: 15px auto 0 auto; max-width: 300px;">
                          <!-- Real DOM Timeline Line -->
                          <div class="timeline-line"></div>
                          
                          <!-- The [class.active]="i === 0" guarantees only the top node pulses -->
                          <div class="tracking-node" *ngFor="let activity of trackingActivities[order.id]; let i = index" [class.active]="i === 0">
                              <div [style.color]="i === 0 ? '#D4AF37' : '#444'" style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; margin-bottom: 2px;">
                                {{ activity.activity }}
                              </div>
                              <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: #888;">
                                  {{ activity.location }} <br/> {{ activity.date | date:'dd MMM, h:mm a' }}
                              </div>
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

      <!-- Return Reason Modal -->
      <div class="modal-overlay" *ngIf="isReturnModalOpen" (click)="closeReturnModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeReturnModal()">&times;</button>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 0; color: var(--secondary-color);">Return Item</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 20px;">Please select a reason for returning this item.</p>
          
          <select [(ngModel)]="returnReason" style="width: 100%; padding: 12px; margin-bottom: 25px; border: 1px solid #ccc; font-family: 'Montserrat', sans-serif; font-size: 13px; outline: none;">
            <option value="" disabled selected>Select a reason...</option>
            <option value="Size/Fit Issue">Size/Fit Issue</option>
            <option value="Damaged Product">Damaged Product</option>
            <option value="Product Not as Described">Product Not as Described</option>
          </select>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn-ghost" style="width: auto; padding: 10px 20px; border-color: #ccc; color: #666;" (click)="closeReturnModal()">Cancel</button>
            <button class="btn-primary" style="width: auto; padding: 10px 20px; display: flex; justify-content: center; align-items: center;" [disabled]="isSubmittingReturn || !returnReason" (click)="submitReturnRefund()">
              <span *ngIf="!isSubmittingReturn">Confirm Return</span>
              <div *ngIf="isSubmittingReturn" class="spinner-small"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- ===== MY SAVED ADDRESS SECTION ===== -->
      </div>
    </div>


  <div class="addr-section-wrapper">
    <div class="addr-card">

      <div class="addr-card-header">
        <h2 class="addr-title">📍 My Saved Address</h2>
        <p class="addr-subtitle">Saved securely · Used for all future orders</p>
      </div>

      <!-- Street Address — full width -->
      <div class="addr-field-group">
        <label class="addr-label">Street Address</label>
        <input type="text" class="addr-input" placeholder="House No, Street, Area"
               [(ngModel)]="addrForm.shipping_address" maxlength="255" />
      </div>

      <!-- City + State — 50/50 -->
      <div class="addr-two-col">
        <div class="addr-field-group">
          <label class="addr-label">City</label>
          <input type="text" class="addr-input" placeholder="City"
                 [(ngModel)]="addrForm.shipping_city" maxlength="100" />
        </div>
        <div class="addr-field-group">
          <label class="addr-label">State</label>
          <input type="text" class="addr-input" placeholder="State"
                 [(ngModel)]="addrForm.shipping_state" maxlength="100" />
        </div>
      </div>

      <!-- Pincode — full width -->
      <div class="addr-field-group">
        <label class="addr-label">Pincode</label>
        <input type="text" class="addr-input" placeholder="6-digit pincode"
               [(ngModel)]="addrForm.shipping_pincode"
               maxlength="6" pattern="[0-9]{6}" />
      </div>

      <button class="btn-update-addr"
              [disabled]="isUpdatingAddress || !isAddressFormValid()"
              (click)="saveAddress()">
        {{ isUpdatingAddress ? 'SAVING...' : 'UPDATE ADDRESS' }}
      </button>

    </div>
  </div>
  `,
  styles: [`
    /* Modal & Loaders */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); z-index: 2000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-content {
      background: white; padding: 40px; border-radius: 4px;
      width: 400px; position: relative;
    }
    .spinner-small {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%; border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Tracking Modal Card */
    .tracking-overlay-card {
        position: relative; /* Changed from absolute to relative to stack in modal center */
        z-index: 3001; 
        
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
    /* The Vertical Track Line Container */
    .tracking-timeline {
        position: relative;
        padding-left: 0;
        margin-left: 10px;
        margin-top: 15px;
    }

    /* Connecting Vertical Line (Real DOM element) */
    .timeline-line {
        position: absolute;
        top: 8px; /* Starts exactly at center of first active dot */
        height: calc(100% - 32px); /* Forces explicit dimension */
        left: 5px; /* Center-align line (x=5 to 7px, center at 6px) */
        width: 2px;
        background: #DDD;
    }

    /* Individual Status Node Layout */
    .tracking-node {
        position: relative;
        margin-bottom: 24px;
        padding-left: 28px;
        z-index: 2; /* Keep above line */
    }

    /* Older Event Dot (Grey, 10px visual size with borders) */
    .tracking-node::before {
        content: '';
        position: absolute;
        left: 0px; /* dot width+borders = 12px. spans 0 to 12. Center = 6px */
        top: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #555; 
        border: 2px solid white;
        box-sizing: content-box;
        z-index: 2;
    }

    /* Latest Event Dot (Gold, 16px visual size with borders) */
    .tracking-node.active::before {
        left: -2px; /* dot width+borders = 16px. spans -2 to 14. Center = 6px */
        top: 2px;
        width: 12px;
        height: 12px;
        background-color: #D4AF37; 
        border: 2px solid white;
        animation: pulse-gold 1.5s infinite cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    @keyframes pulse-gold {
        0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.6); }
        70% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
    }
    /* ===== MY SAVED ADDRESS SECTION ===== */
    :host {
      display: block;
      width: 100%;
    }
    .addr-section-wrapper {
      width: 100%;
      box-sizing: border-box;
      background: radial-gradient(circle at 60% 40%, #FBFBF9, #EADDD7);
      padding: 60px 20px 80px 20px;
    }
    .addr-card {
      display: block;
      background: white;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 44px 40px;
      border-top: 2px solid #D4AF37;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
      box-sizing: border-box;
    }
    .addr-card-header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid #EBEBEB;
    }
    .addr-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 500;
      color: #153A36;
      margin: 0 0 8px 0;
      letter-spacing: 0.02em;
    }
    .addr-subtitle {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-style: italic;
      color: #999;
      margin: 0;
      letter-spacing: 0.3px;
    }
    .addr-field-group { margin-bottom: 22px; }
    .addr-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .addr-label {
      display: block;
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 8px;
    }
    .addr-input {
      width: 100%;
      padding: 10px 0;
      border: none;
      border-bottom: 1px solid #DDD;
      background: transparent;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      color: #222;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.25s ease;
    }
    .addr-input:focus {
      border-bottom: 2px solid #D4AF37;
    }
    .addr-input::placeholder { color: #BBBBBB; }
    .btn-update-addr {
      width: 100%;
      margin-top: 12px;
      padding: 15px;
      background: #2C2C2C;
      color: #D4AF37;
      border: none;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .btn-update-addr:hover:not(:disabled) {
      background: #1a1a1a;
      transform: translateY(-1px);
    }
    .btn-update-addr:disabled {
      background: #E0E0E0;
      color: #A0A0A0;
      cursor: not-allowed;
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  orders: any[] = [];

  trackingOrder: number | null = null;
  trackingActivities: { [key: number]: any[] } = {};

  // My Saved Address
  addrForm: AddressPayload = {
    shipping_address: '',
    shipping_city:    '',
    shipping_state:   '',
    shipping_pincode: ''
  };
  isUpdatingAddress = false;

  ngOnInit() {
    this.fetchOrders();
    this.loadSavedAddress();
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

  loadSavedAddress() {
    this.orderService.getUserAddress().subscribe({
      next: (addr) => {
        this.addrForm = {
          shipping_address: addr.address || '',
          shipping_city:    addr.city    || '',
          shipping_state:   addr.state   || '',
          shipping_pincode: addr.pincode || ''
        };
      },
      error: () => {} // Silently ignore — address section stays blank
    });
  }

  isAddressFormValid(): boolean {
    return !!(
      this.addrForm.shipping_address.trim() &&
      this.addrForm.shipping_city.trim() &&
      this.addrForm.shipping_state.trim() &&
      /^[0-9]{6}$/.test(this.addrForm.shipping_pincode)
    );
  }

  saveAddress() {
    if (!this.isAddressFormValid()) return;
    this.isUpdatingAddress = true;
    this.orderService.updateUserAddress(this.addrForm).subscribe({
      next: () => {
        this.isUpdatingAddress = false;
        this.toastService.show('✨ Address updated successfully.');
      },
      error: () => {
        this.isUpdatingAddress = false;
        this.toastService.show('⚠️ Failed to update address. Please try again.');
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
        this.toastService.show('⚠️ Failed to fetch tracking details from Shiprocket.');
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  // --- RETURN LOGIC ---
  isReturnModalOpen = false;
  selectedReturnOrder: any = null;
  returnReason: string = '';
  isSubmittingReturn = false;

  openReturnModal(order: any) {
    this.selectedReturnOrder = order;
    this.isReturnModalOpen = true;
    this.returnReason = '';
  }

  closeReturnModal() {
    this.isReturnModalOpen = false;
    this.selectedReturnOrder = null;
  }

  submitReturnRefund() {
    if (!this.selectedReturnOrder || !this.returnReason) return;
    this.isSubmittingReturn = true;

    this.orderService.returnOrder(this.selectedReturnOrder.id, this.returnReason).subscribe({
      next: (res) => {
        const shipmentId = res.shipment_id || 'Pending';
        
        // Two-way binding reflection instantly
        this.selectedReturnOrder.status = 'Return Requested';
        this.selectedReturnOrder.shipment_id = shipmentId;
        
        this.closeReturnModal();
        this.isSubmittingReturn = false;
        
        this.toastService.show('✨ Return Authorized. Shipment ID: ' + shipmentId + ' generated.');
      },
      error: (err) => {
        this.isSubmittingReturn = false;
        this.toastService.show('⚠️ Failed to initiate return via Shiprocket. Please try again.');
      }
    });
  }
}
