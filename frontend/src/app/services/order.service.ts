import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface AddressPayload {
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  selected_size?: string;
  custom_measurements?: string | null;
}

export interface UserAddress {
  name: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  /** Fetch saved address + name + phone for "Deliver to" card */
  getUserAddress(): Observable<UserAddress> {
    return this.http.get<UserAddress>(`${this.apiUrl}/user/address`, {
      headers: this.getAuthHeaders()
    });
  }

  /** Update saved address from My Orders page */
  updateUserAddress(payload: AddressPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/address`, {
      address: payload.shipping_address,
      city:    payload.shipping_city,
      state:   payload.shipping_state,
      pincode: payload.shipping_pincode,
    }, { headers: this.getAuthHeaders() });
  }

  /** Place order — sends product_id + address + size fields */
  placeOrder(productId: number, address: AddressPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, {
      product_id:           productId,
      shipping_address:     address.shipping_address,
      shipping_city:        address.shipping_city,
      shipping_state:       address.shipping_state,
      shipping_pincode:     address.shipping_pincode,
      selected_size:        address.selected_size        ?? null,
      custom_measurements:  address.custom_measurements  ?? null,
    }, { headers: this.getAuthHeaders() });
  }

  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`, {
      headers: this.getAuthHeaders()
    });
  }

  trackOrder(trackingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipments/track/${trackingId}`, {
      headers: this.getAuthHeaders()
    });
  }

  returnOrder(orderId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${orderId}/return`, { reason }, {
      headers: this.getAuthHeaders()
    });
  }
}
