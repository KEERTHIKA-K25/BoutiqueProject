import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card" style="text-align: center;">
        <h2>Verify Your Mobile</h2>
        <p style="color: #666; margin-bottom: 30px;">
          We've sent a 6-digit verification code to your mobile number. Check the laravel.log!
        </p>
        
        <div class="form-group">
          <input type="text" [(ngModel)]="otpCode" placeholder="Enter OTP (e.g. 123456)" 
                 style="text-align: center; font-size: 24px; letter-spacing: 5px;" 
                 maxlength="6" />
        </div>

        <div class="error-text" *ngIf="errorMessage" style="margin-bottom: 15px;">
          {{ errorMessage }}
        </div>

        <button class="btn-primary" (click)="verify()" [disabled]="isLoading || otpCode.length < 6">
          {{ isLoading ? 'Verifying...' : 'Complete Registration' }}
        </button>
      </div>
    </div>
  `
})
export class VerifyOtpComponent {
  otpCode = '';
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  verify() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyOtp(this.otpCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }
}
