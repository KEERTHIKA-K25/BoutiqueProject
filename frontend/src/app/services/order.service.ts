import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  placeOrder(productId: number): Observable<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null;
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post(`${this.apiUrl}/orders`, { product_id: productId }, { headers });
  }

  getUserOrders(): Observable<any[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null;
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<any[]>(`${this.apiUrl}/orders`, { headers });
  }

  trackOrder(trackingId: string): Observable<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null;
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<any>(`${this.apiUrl}/shipments/track/${trackingId}`, { headers });
  }
}
