import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login.component').then(c => c.LoginComponent) },
    { path: 'register', loadComponent: () => import('./register/register.component').then(c => c.RegisterComponent) },
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent) },
    { path: 'my-orders', loadComponent: () => import('./my-orders/my-orders.component').then(c => c.MyOrdersComponent) },
    { path: 'verify-otp', loadComponent: () => import('./verify-otp/verify-otp.component').then(c => c.VerifyOtpComponent) },
    { path: 'admin/orders', loadComponent: () => import('./admin-orders/admin-orders.component').then(c => c.AdminOrdersComponent) }
];
