import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login.component').then(c => c.LoginComponent) },
    { path: 'register', loadComponent: () => import('./register/register.component').then(c => c.RegisterComponent) },
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent) },
    { path: 'my-orders', loadComponent: () => import('./my-orders/my-orders.component').then(c => c.MyOrdersComponent) },
    { path: 'verify-otp', loadComponent: () => import('./verify-otp/verify-otp.component').then(c => c.VerifyOtpComponent) },
    { path: 'new-arrivals', loadComponent: () => import('./new-arrivals/new-arrivals.component').then(c => c.NewArrivalsComponent) },
    { path: 'admin/login', loadComponent: () => import('./admin-login/admin-login.component').then(c => c.AdminLoginComponent) },
    { path: 'admin/dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent), canActivate: [adminGuard] },
    { path: 'admin/orders', redirectTo: 'admin/dashboard' }
];
