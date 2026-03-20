import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();

  show(message: string, duration = 4000): void {
    this.messageSubject.next(message);
    setTimeout(() => this.messageSubject.next(''), duration);
  }
}
