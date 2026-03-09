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
    <div class="auth-container">
      <div class="auth-card">
        <h2>Welcome Back</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" formControlName="email" placeholder="Enter your email" />
            <div class="error-text" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" formControlName="password" placeholder="Enter your password" />
            <div class="error-text" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required.
            </div>
          </div>

          <div class="error-text text-center" *ngIf="errorMessage" style="margin-bottom: 15px;">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center mt-3">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
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
          localStorage.setItem('auth_token', response.access_token);
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
