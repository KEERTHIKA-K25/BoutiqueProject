import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    adminLogin(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/login`, credentials);
    }

    isAdmin(): boolean {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('is_admin') === 'true' && !!localStorage.getItem('admin_auth_token');
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    logout(): Observable<any> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user_auth_token');
            localStorage.removeItem('auth_token'); // Clear legacy token if exists
        }
        return this.http.post(`${this.apiUrl}/logout`, {}, { headers });
    }

    adminLogout(): Observable<any> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('is_admin');
            localStorage.removeItem('auth_token'); // Clear legacy token if exists
        }
        return this.http.post(`${this.apiUrl}/logout`, {}, { headers });
    }

    verifyOtp(otp: string): Observable<any> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null;
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this.apiUrl}/verify-otp`, { otp }, { headers });
    }
}
