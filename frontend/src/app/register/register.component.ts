import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="luxe-auth-wrapper">
      <div class="auth-card fade-in">
        <h2 class="serif-title text-center">Create Account</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" style="margin-top: 30px;">
          <div class="form-group relative">
            <span class="input-icon">👤</span>
            <input type="text" id="name" formControlName="name" class="auth-input" placeholder="Full Name" />
            <div class="error-text" *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
              Name is required.
            </div>
          </div>

          <div class="form-group relative" style="margin-top: 15px;">
            <span class="input-icon">✉️</span>
            <input type="email" id="email" formControlName="email" class="auth-input" placeholder="Email Address" />
            <div class="error-text" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>

          <div class="form-group relative" style="margin-top: 15px;">
            <span class="country-code">+91</span>
            <input type="text" id="phone" formControlName="phone" class="auth-input pad-phone" placeholder="Mobile Number" />
            <div class="error-text" *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched">
              Valid phone number is required.
            </div>
          </div>

          <div class="form-group relative" style="margin-top: 15px;">
            <span class="input-icon">🔒</span>
            <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" class="auth-input" placeholder="Create Password" />
            <span class="password-toggle" (click)="showPassword = !showPassword">
               {{ showPassword ? '🙈' : '👁️' }}
            </span>
            <div class="error-text" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password must be at least 8 characters.
            </div>
          </div>

          <div class="form-group relative" style="margin-top: 15px;">
            <span class="input-icon">🔒</span>
            <input [type]="showConfirmPassword ? 'text' : 'password'" id="password_confirmation" formControlName="password_confirmation" class="auth-input" placeholder="Confirm Password" />
            <span class="password-toggle" (click)="showConfirmPassword = !showConfirmPassword">
               {{ showConfirmPassword ? '🙈' : '👁️' }}
            </span>
            <div class="error-text" *ngIf="registerForm.hasError('mismatch') && registerForm.get('password_confirmation')?.touched">
              Passwords do not match.
            </div>
          </div>

          <div class="error-text text-center" *ngIf="errorMessage" style="margin-top: 20px;">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-auth-primary" [disabled]="registerForm.invalid || isLoading" style="margin-top: 30px;">
            {{ isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT' }}
          </button>
        </form>

        <p class="text-center" style="margin-top: 30px; font-size: 13px; color: #666;">
          Already have an account? <a routerLink="/login" class="auth-gold-link">Sign in</a>
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
    .country-code {
      position: absolute;
      left: 15px;
      top: 13px;
      font-size: 13px;
      font-weight: 500;
      color: #333;
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
    .auth-input.pad-phone {
      padding-left: 50px;
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
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('user_auth_token', response.access_token);
          this.router.navigate(['/verify-otp']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
