import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
            <!-- <span class="input-icon" style="top: 15px; left: 20px; font-size: 16px;">📱</span> -->
            <input type="text" [(ngModel)]="otpCode" class="auth-input otp-vault-input"
                   placeholder="Enter 6-digit code" maxlength="6" />
          </div>

          @if (errorMessage) {
            <div class="error-text text-center" style="margin-top: 20px;">
              {{ errorMessage }}
            </div>
          }

          <button class="btn-auth-primary" (click)="verify()"
                  [disabled]="isLoading || otpCode.length < 6"
                  style="margin-top: 35px;">
            {{ isLoading ? 'VERIFYING...' : 'COMPLETE REGISTRATION' }}
          </button>

          <!-- Resend Section: only visible after 30s on page load OR a failed attempt -->
          <div style="margin-top: 22px; min-height: 36px; display: flex; align-items: center; justify-content: center;">
            @if (resendVisible && cooldown === 0) {
              <button class="btn-resend" (click)="resendOtp()" [disabled]="isResending">
                {{ isResending ? 'Sending...' : 'Resend Code' }}
              </button>
            }
            @if (cooldown > 0) {
              <span class="cooldown-text">Resend available in {{ cooldown }}s</span>
            }
          </div>

        </div>

        <!-- Slide-in toast notification -->
        @if (toastVisible) {
          <div class="resend-toast">{{ toastMessage }}</div>
        }

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
      border: 2px solid #D4AF37;
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
      box-shadow: 0 8px 20px rgba(44, 44, 44, 0.2);
      transform: translateY(-2px);
    }
    .btn-auth-primary[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    /* Ghost Gold Resend Button */
    .btn-resend {
      background: transparent;
      border: 1px solid #D4AF37;
      color: #D4AF37;
      padding: 10px 24px;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-resend:hover:not([disabled]) {
      background: #D4AF37;
      color: white;
    }
    .btn-resend[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    /* Countdown text */
    .cooldown-text {
      font-size: 12px;
      color: #aaa;
      font-family: 'Montserrat', sans-serif;
      letter-spacing: 0.5px;
    }
    /* Slide-in toast */
    .resend-toast {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: white;
      padding: 14px 22px;
      border-left: 3px solid #D4AF37;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      font-size: 13px;
      font-family: 'Montserrat', sans-serif;
      color: #153A36;
      border-radius: 4px;
      animation: slideIn 0.3s ease;
      z-index: 9999;
      max-width: 320px;
      text-align: left;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .error-text {
      color: #c94c4c;
      font-size: 11px;
    }
  `]
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  otpCode = '';
  isLoading = false;
  isResending = false;
  errorMessage = '';

  // Resend visibility — hidden on page load, revealed after 30s or a failed attempt
  resendVisible = false;
  resendRevealTimer: any;

  // Cooldown countdown
  cooldown = 0;
  cooldownInterval: any;

  // Toast
  toastMessage = '';
  toastVisible = false;
  toastTimer: any;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Auto-reveal Resend button after 30 seconds on page load
    this.resendRevealTimer = setTimeout(() => {
      this.resendVisible = true;
    }, 30000);
  }

  ngOnDestroy() {
    // Clean up all timers to prevent memory leaks
    clearInterval(this.cooldownInterval);
    clearTimeout(this.resendRevealTimer);
    clearTimeout(this.toastTimer);
  }

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
        // Immediately reveal resend button on first wrong attempt
        this.resendVisible = true;
        clearTimeout(this.resendRevealTimer); // Cancel the 30s auto-reveal timer
      }
    });
  }

  resendOtp() {
    this.isResending = true;

    this.authService.resendOtp().subscribe({
      next: () => {
        this.isResending = false;
        this.startCooldown(); // ← ONLY on success
        this.showToast('✨ A new verification code has been sent to your mobile.');
      },
      error: (err) => {
        this.isResending = false;
        // ✅ No startCooldown() here — countdown NEVER starts on error
        this.showToast('⚠️ ' + (err.error?.message || 'Could not resend OTP. Please try again.'));
      }
    });
  }

  startCooldown() {
    this.cooldown = 30;
    clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.cooldownInterval);
        this.cooldown = 0;
      }
    }, 1000);
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 4000);
  }
}
