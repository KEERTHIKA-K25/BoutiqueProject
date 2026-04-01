import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-returns',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; background-color: #FBFBF9; font-family: 'Montserrat', sans-serif;">
      
      <!-- L&L Sidebar -->
      <div style="background-color: #EADDD7; padding: 40px 20px; display: flex; flex-direction: column;">
        <div style="text-align: center; margin-bottom: 50px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #153A36; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">Luxe & Lace</h1>
          <div style="font-size: 9px; letter-spacing: 0.2em; color: #555; margin-top: 5px;">BOUTIQUE ADMIN</div>
        </div>

        <nav style="display: flex; flex-direction: column; gap: 10px;">
          <a class="sidebar-link" (click)="goToDashboard()">Dashboard</a>
          <a class="sidebar-link" (click)="goToDashboard('orders')">Manage Orders</a>
          <a class="sidebar-link active">Return Orders</a>
          <a class="sidebar-link" (click)="goToDashboard('inventory')">Inventory</a>
        </nav>

        <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05);">
            <a style="cursor: pointer; font-size: 13px; font-weight: 500; color: #c94c4c; text-decoration: none;" (click)="logout()">Sign Out Securely</a>
        </div>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px; overflow-y: auto;">
        
        <div class="admin-dashboard-container">
          <div class="header">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #153A36; margin: 0; font-weight: 400;">Return Orders Dashboard</h2>
            <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Manage customer refunds and Shiprocket reverse pickups.</p>
          </div>

          <div *ngIf="returnRequests.length === 0" style="text-align: center; padding: 80px 20px; margin-top: 40px; background: white; border: 1px solid #EBEBEB;">
            <p style="font-size: 16px; color: #888; font-style: italic;">✨ No pending returns found. You're all caught up!</p>
          </div>

          <div class="table-card" *ngIf="returnRequests.length > 0" style="background: white; border: 1px solid #EBEBEB; margin-top: 40px; overflow-x: auto;">
            <table class="premium-admin-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid #EBEBEB; background: #FBFBF9;">
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Return ID</th>
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Parent Order #</th>
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Customer Details</th>
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Reason</th>
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Shiprocket Return AWB</th>
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Status</th>
                  <th style="padding: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--secondary-color);">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let returnReq of returnRequests" style="border-bottom: 1px solid #F0F0F0; transition: background 0.3s;">
                  <td style="padding: 15px; font-size: 13px; color: var(--secondary-color);">#RET-{{ returnReq.id }}</td>
                  <td style="padding: 15px; font-size: 13px;">#ORD-{{ returnReq.order_id }}</td>
                  
                  <td style="padding: 15px;">
                    <div class="customer-name" style="font-weight: 500; font-size: 13px;">{{ returnReq.order?.user?.name }}</div>
                    <div class="customer-email" style="font-size: 11px; color: #888; margin-top: 3px;">{{ returnReq.order?.user?.email }}</div>
                  </td>
                  
                  <td style="padding: 15px; font-size: 13px; font-style: italic; color: #555;"> "{{ returnReq.reason }}"</td>
                  <td style="padding: 15px; font-size: 13px;">{{ returnReq.shipment_id }}</td>
                  
                  <td style="padding: 15px;">
                    <span style="font-size: 10px; padding: 4px 8px; border-radius: 2px; text-transform: uppercase; font-weight: 600; border: 1px solid #153A36; color: #153A36; background: rgba(21, 58, 54, 0.05);" *ngIf="returnReq.status === 'Pending'">
                      {{ returnReq.status }}
                    </span>
                    <span style="font-size: 10px; padding: 4px 8px; border-radius: 2px; text-transform: uppercase; font-weight: 600; border: 1px solid #D4AF37; color: #D4AF37; background: rgba(212, 175, 55, 0.08);" *ngIf="returnReq.status === 'Completed'">
                      {{ returnReq.status }}
                    </span>
                  </td>

                  <td style="padding: 15px; display: flex; gap: 10px;">
                    <button class="btn-approve" 
                            style="padding: 8px 15px; font-size: 10px; font-weight: 600; cursor: pointer; border: none; background-color: #153A36; color: white;"
                            *ngIf="returnReq.status === 'Pending'"
                            (click)="openConfirmationModal(returnReq.id, 'APPROVE', returnReq.order?.total_amount)">
                      Approve Refund
                    </button>
                    
                    <button class="btn-reject" 
                            style="padding: 8px 15px; font-size: 10px; font-weight: 600; cursor: pointer; background: transparent; border: 1px solid #153A36; color: #153A36;"
                            *ngIf="returnReq.status === 'Pending'"
                            (click)="openConfirmationModal(returnReq.id, 'REJECT', returnReq.order?.total_amount)">
                      Reject Return
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Custom Confirmation Modal -->
        <div class="modal-overlay" *ngIf="isConfirmModalOpen" (click)="closeConfirmationModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 0; color: #153A36;">Confirm Action</h3>
            <p style="font-size: 13px; color: #666; margin-bottom: 25px; line-height: 1.5;">
              Are you absolutely sure you want to <strong>{{ pendingAction }}</strong> this return request for Order #{{ pendingReturnId }}?
              <span *ngIf="pendingAction === 'APPROVE'" style="display: block; margin-top: 10px; color: #c94c4c; font-weight: 500;">
                This will authorize a refund of ₹{{ pendingAmount }}.
              </span>
            </p>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button class="btn-ghost" style="width: auto; padding: 10px 20px; border: 1px solid #ccc; color: #666; background: transparent; cursor: pointer;" (click)="closeConfirmationModal()">Cancel</button>
              <button class="btn-approve" style="width: auto; padding: 10px 20px; background-color: #153A36; color: white; border: none; cursor: pointer; font-weight: 600;" (click)="confirmAndProcess()">Confirm</button>
            </div>
          </div>
        </div>

        <!-- Custom Toast Notification -->
        <div class="toast-notification" *ngIf="toastVisible">
          <div class="toast-content" style="background: white; padding: 15px 25px; border-radius: 4px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 4px solid #153A36;">
            <p style="margin: 0; font-size: 13px; font-weight: 500; color: #153A36;">{{ toastMessage }}</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .sidebar-link {
        display: block;
        padding: 12px 15px;
        color: #153A36;
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 4px;
    }
    .sidebar-link:hover {
        background-color: rgba(255,255,255,0.4);
    }
    .sidebar-link.active {
        background-color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .btn-approve:hover { background-color: #0c2421; }
    .btn-reject:hover { background-color: rgba(21, 58, 54, 0.05); }

    /* Modal Overlay Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); z-index: 2000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-content {
      background: white; padding: 30px 40px; border-radius: 4px;
      width: 450px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .toast-notification {
      position: fixed; bottom: 30px; right: 30px; z-index: 2000;
      animation: slideIn 0.3s ease forwards;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class AdminReturnsComponent implements OnInit {
  returnRequests: any[] = [];
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.fetchReturnRequests();
  }

  fetchReturnRequests() {
    const token = localStorage.getItem('admin_auth_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<any[]>(environment.apiUrl + '/admin/returns', { headers }).subscribe({
      next: (data) => {
        this.returnRequests = data;
      },
      error: (err) => {
        console.error('Failed to load returns', err);
      }
    });
  }

  // --- CUSTOM OVERLAY STATE ---
  isConfirmModalOpen = false;
  pendingReturnId: number | null = null;
  pendingAction: 'APPROVE' | 'REJECT' | null = null;
  pendingAmount: number = 0;

  toastMessage = '';
  toastVisible = false;

  openConfirmationModal(id: number, action: 'APPROVE' | 'REJECT', amount: number) {
    this.pendingReturnId = id;
    this.pendingAction = action;
    this.pendingAmount = amount;
    this.isConfirmModalOpen = true;
  }

  closeConfirmationModal() {
    this.isConfirmModalOpen = false;
    this.pendingReturnId = null;
    this.pendingAction = null;
    this.pendingAmount = 0;
  }

  confirmAndProcess() {
    if (!this.pendingReturnId || !this.pendingAction) return;

    const id = this.pendingReturnId;
    const action = this.pendingAction;
    const token = localStorage.getItem('admin_auth_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.patch(environment.apiUrl + '/admin/returns/' + id + '/process', { action }, { headers }).subscribe({
      next: (res) => {
        this.returnRequests = this.returnRequests.filter(r => r.id !== id);
        
        this.showToast('✨ Successfully ' + (action === 'APPROVE' ? 'Approved & Refunded' : 'Rejected') + ' Return #' + id);
        this.closeConfirmationModal();
      },
      error: (err) => {
        this.showToast('⚠️ Failed to process return via server. Please try again.');
        this.closeConfirmationModal();
        console.error(err);
      }
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 4000);
  }

  goToDashboard(tabSelection?: string) {
      if (tabSelection) {
        this.router.navigate(['/admin/dashboard'], { queryParams: { tab: tabSelection } });
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
  }

  logout() {
    this.authService.logout().subscribe({
        next: () => this.router.navigate(['/admin/login']),
        error: () => this.router.navigate(['/admin/login'])
    });
  }
}
