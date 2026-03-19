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
    <div class="luxe-auth-wrapper">
      <div class="auth-card fade-in text-center">
        <h2 class="serif-title">Verify Your Mobile</h2>
        
        <p class="auth-instruction">
          For your security, we've sent a 6-digit verification code to your mobile number. 
          Please enter it below to secure your account.
        </p>
        
        <div style="margin-top: 30px;">
          
          <div class="form-group relative">
            <span class="input-icon" style="top: 15px; left: 20px; font-size: 16px;">📱</span>
            
            <input type="text" [(ngModel)]="otpCode" class="auth-input otp-vault-input" 
                   placeholder="Enter 6-digit code" maxlength="6" />
                   
          </div>

          <div class="error-text text-center" *ngIf="errorMessage" style="margin-top: 20px;">
            {{ errorMessage }}
          </div>

          <button class="btn-auth-primary" (click)="verify()" [disabled]="isLoading || otpCode.length < 6" style="margin-top: 35px;">
            {{ isLoading ? 'VERIFYING...' : 'COMPLETE REGISTRATION' }}
          </button>
          
        </div>
        
        <p style="margin-top: 25px; font-size: 10px; color: #ccc;">
          Didn't receive it? Check your mobile inbox.
        </p>

      </div>
    </div>
  `,
  styles: [`
    .luxe-auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #FBFBF9 0%, #EADDD7 100%);
      padding: 20px;
    }
    .auth-card {
      background: white;
      width: 100%;
      max-width: 420px;
      border-radius: 15px;
      padding: 50px 40px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
      border-top: 2px solid #D4AF37;
      position: relative;
    }
    .text-center { text-align: center; }
    .serif-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #153A36;
      margin: 0;
    }
    .auth-instruction {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      margin-top: 15px;
    }
    .relative { position: relative; }
    .input-icon {
      position: absolute;
      opacity: 0.6;
      pointer-events: none;
    }
    
    .auth-input.otp-vault-input {
      width: 100%;
      padding: 15px 40px 15px 50px;
      font-family: 'Montserrat', sans-serif;
      font-size: 16px;
      letter-spacing: 8px;
      font-weight: 500;
      text-align: center;
      border: 2px solid #D4AF37; /* Vault style */
      border-radius: 8px;
      outline: none;
      transition: all 0.3s ease;
      background: white;
      box-sizing: border-box;
      color: #2c2c2c;
    }
    .auth-input.otp-vault-input:focus {
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
    }
    .auth-input.otp-vault-input::placeholder {
      letter-spacing: normal;
      font-size: 13px;
      font-weight: 400;
      color: #aaa;
    }
    
    .btn-auth-primary {
      width: 100%;
      padding: 15px;
      background-color: #2c2c2c;
      color: #D4AF37;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-auth-primary:hover:not([disabled]) {
      background-color: #1a1a1a;
      box-shadow: 0 8px 20px rgba(44,44,44, 0.2);
      transform: translateY(-2px);
    }
    .btn-auth-primary[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-text {
      color: #c94c4c;
      font-size: 11px;
    }
  `]
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
