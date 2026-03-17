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
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create Account</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" formControlName="name" placeholder="Enter your full name" />
            <div class="error-text" *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
              Name is required.
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" formControlName="email" placeholder="Enter your email" />
            <div class="error-text" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Mobile Number</label>
            <input type="text" id="phone" formControlName="phone" placeholder="Enter mobile for OTP verification" />
            <div class="error-text" *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched">
              Valid phone number is required.
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" formControlName="password" placeholder="Create a strong password" />
            <div class="error-text" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password must be at least 8 characters.
            </div>
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirm Password</label>
            <input type="password" id="password_confirmation" formControlName="password_confirmation" placeholder="Confirm your password" />
            <div class="error-text" *ngIf="registerForm.hasError('mismatch') && registerForm.get('password_confirmation')?.touched">
              Passwords do not match.
            </div>
          </div>

          <div class="error-text text-center" *ngIf="errorMessage" style="margin-bottom: 15px;">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="text-center mt-3">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
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
