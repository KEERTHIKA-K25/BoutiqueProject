import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    @if (message()) {
      <div class="luxury-toast">{{ message() }}</div>
    }
  `,
  styles: [`
    .luxury-toast {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: white;
      padding: 14px 22px;
      border-left: 3px solid #D4AF37;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      font-size: 13px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      color: #153A36;
      border-radius: 4px;
      z-index: 99999;
      max-width: 360px;
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      line-height: 1.5;
    }

    @keyframes toastSlideIn {
      from {
        transform: translateX(110%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);

  // Angular 17 signal — no async pipe, no CommonModule needed
  message = toSignal(this.toastService.message$, { initialValue: '' });
}
