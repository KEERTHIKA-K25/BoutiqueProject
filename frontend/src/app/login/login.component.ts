import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="luxe-auth-wrapper">
      <div class="auth-card fade-in">
        <h2 class="serif-title text-center">Welcome Back</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" style="margin-top: 30px;">
          <div class="form-group relative">
            <span class="input-icon">✉️</span>
            <input type="email" id="email" formControlName="email" class="auth-input" placeholder="Email Address" />
            <div class="error-text" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>

          <div class="form-group relative" style="margin-top: 20px;">
            <span class="input-icon">🔒</span>
            <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" class="auth-input" placeholder="Password" />
            <span class="password-toggle" (click)="showPassword = !showPassword">
               {{ showPassword ? '🙈' : '👁️' }}
            </span>
            <div class="error-text" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required.
            </div>
          </div>

          <div class="error-text text-center" *ngIf="errorMessage" style="margin-top: 20px;">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-auth-primary" [disabled]="loginForm.invalid || isLoading" style="margin-top: 30px;">
            {{ isLoading ? 'SIGNING IN...' : 'SIGN IN' }}
          </button>
        </form>

        <p class="text-center" style="margin-top: 30px; font-size: 13px; color: #666;">
          Don't have an account? <a routerLink="/register" class="auth-gold-link">Register here</a>
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
    .serif-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #153A36;
      margin: 0;
    }
    .relative { position: relative; }
    .input-icon {
      position: absolute;
      left: 15px;
      top: 13px;
      font-size: 14px;
      opacity: 0.6;
      pointer-events: none;
    }
    .password-toggle {
      position: absolute;
      right: 15px;
      top: 13px;
      font-size: 14px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s;
    }
    .password-toggle:hover { opacity: 1; }
    
    .auth-input {
      width: 100%;
      padding: 14px 40px 14px 42px;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      border: 1px solid #EBEBEB;
      border-radius: 8px;
      outline: none;
      transition: all 0.3s ease;
      background: #FAFAFA;
      box-sizing: border-box;
    }
    .auth-input:focus {
      background: white;
      border-color: #D4AF37;
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.15);
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
    
    .auth-gold-link {
      color: #D4AF37;
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .auth-gold-link:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
    .error-text {
      color: #c94c4c;
      font-size: 11px;
      margin-top: 5px;
      text-align: left;
    }
  `]
})
export class LoginComponent {
  showPassword = false;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('user_auth_token', response.access_token);
          if (response.otp_verified === false) {
            this.router.navigate(['/verify-otp']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    }
  }
}
