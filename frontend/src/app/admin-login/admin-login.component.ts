import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #FFFFFF; font-family: 'Montserrat', sans-serif;">
      
      <div style="background: white; padding: 50px; border-radius: 4px; box-shadow: 0 15px 50px rgba(0,0,0,0.06); width: 100%; max-width: 450px; border-top: 5px solid #153A36;">
        
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #153A36; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">Luxe & Lace</h1>
          <div style="font-size: 10px; letter-spacing: 0.3em; color: #555; margin-top: 5px;">SECURE ADMIN PORTAL</div>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div style="margin-bottom: 25px;">
            <label style="display: block; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px;">Admin Email</label>
            <input type="email" [(ngModel)]="credentials.email" name="email" required
                   style="width: 100%; padding: 12px 15px; border: 1px solid #EBEBEB; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 14px; outline: none; transition: border-color 0.3s; box-sizing: border-box;"
                   onfocus="this.style.borderColor='#153A36'" onblur="this.style.borderColor='#EBEBEB'">
          </div>

          <div style="margin-bottom: 35px;">
            <label style="display: block; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px;">Password</label>
            <input type="password" [(ngModel)]="credentials.password" name="password" required
                   style="width: 100%; padding: 12px 15px; border: 1px solid #EBEBEB; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 14px; outline: none; transition: border-color 0.3s; box-sizing: border-box;"
                   onfocus="this.style.borderColor='#153A36'" onblur="this.style.borderColor='#EBEBEB'">
          </div>

          <div *ngIf="errorMessage" style="color: #c94c4c; font-size: 12px; margin-bottom: 20px; text-align: center;">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="isLoading"
                  style="width: 100%; padding: 14px; background-color: #153A36; color: white; border: none; border-radius: 2px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: background-color 0.3s;"
                  onmouseover="this.style.backgroundColor='#0d2724'" onmouseout="this.style.backgroundColor='#153A36'">
            {{ isLoading ? 'VERIFYING...' : 'SECURE ACCESS' }}
          </button>
        </form>

      </div>

    </div>
  `
})
export class AdminLoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    credentials = { email: '', password: '' };
    errorMessage = '';
    isLoading = false;

    onSubmit() {
        this.isLoading = true;
        this.errorMessage = '';

        this.authService.adminLogin(this.credentials).subscribe({
            next: (res) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('admin_auth_token', res.access_token);
                    localStorage.setItem('is_admin', res.is_admin ? 'true' : 'false');
                }
                this.router.navigate(['/admin/dashboard']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Access Denied. Invalid credentials or insufficient permissions.';
            }
        });
    }
}
