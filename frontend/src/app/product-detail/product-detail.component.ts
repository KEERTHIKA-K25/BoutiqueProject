import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { OrderService, UserAddress, AddressPayload } from '../services/order.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrapper">

      <!-- ===== NAV BAR ===== -->
      <div class="nav-bar">
        <div style="flex: 1;">
          <a routerLink="/dashboard" class="back-link">← Back to Catalog</a>
        </div>
        <div style="flex: 1; text-align: center;">
          <span class="nav-brand">LUXE & LACE</span>
          <div class="nav-tagline">BOUTIQUE</div>
        </div>
        <div style="flex: 1;"></div>
      </div>

      <!-- ===== LOADING STATE ===== -->
      @if (isLoading) {
        <div style="display:flex; justify-content:center; align-items:center; min-height: 400px;">
          <p style="font-family:'Montserrat',sans-serif; color:#D4AF37; letter-spacing:2px; font-size:13px;">LOADING...</p>
        </div>
      }

      <!-- ===== PRODUCT NOT FOUND ===== -->
      @if (!isLoading && !product) {
        <div style="text-align:center; padding: 100px 20px;">
          <h2 style="font-family:'Playfair Display',serif; color:#153A36;">Product Not Found</h2>
          <a routerLink="/dashboard" class="back-link" style="margin-top:20px; display:inline-block;">← Return to Catalog</a>
        </div>
      }

      <!-- ===== PRODUCT DETAIL ===== -->
      @if (!isLoading && product) {
        <div class="detail-grid">

          <!-- LEFT: Image -->
          <div class="image-col">
            <div class="image-wrapper">
              <img [src]="product.image_url" [alt]="product.name" class="product-img" />
            </div>
          </div>

          <!-- RIGHT: Details -->
          <div class="info-col">

            <!-- Stock Badge -->
            <div class="stock-badge" [class.in-stock]="product.stock > 0" [class.out-of-stock]="product.stock === 0">
              {{ product.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK' }}
            </div>

            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-price">₹{{ product.price }}</div>
            <p class="product-desc">{{ product.description }}</p>

            <div class="gold-divider"></div>

            <!-- ===== SIZE SELECTION ===== -->
            <div class="section-label">SELECT SIZE</div>
            <div class="size-grid">
              @for (size of sizes; track size) {
                <button class="size-btn"
                        [class.size-active]="selectedSize === size"
                        (click)="selectSize(size)">
                  {{ size }}
                </button>
              }
            </div>

            <!-- Custom Size Toggle -->
            <button class="custom-toggle" (click)="toggleCustomSize()">
              {{ showCustomForm ? '▲ Hide custom measurements' : 'Need a custom size? →' }}
            </button>

            <!-- Custom Measurements Form -->
            @if (showCustomForm) {
              <div class="custom-form">
                <div class="measure-grid">
                  <div class="measure-field">
                    <label class="measure-label">Bust (cm)</label>
                    <input type="number" class="measure-input" placeholder="e.g. 90"
                           [(ngModel)]="customMeasurements.bust" min="1" />
                  </div>
                  <div class="measure-field">
                    <label class="measure-label">Waist (cm)</label>
                    <input type="number" class="measure-input" placeholder="e.g. 70"
                           [(ngModel)]="customMeasurements.waist" min="1" />
                  </div>
                  <div class="measure-field">
                    <label class="measure-label">Hips (cm)</label>
                    <input type="number" class="measure-input" placeholder="e.g. 95"
                           [(ngModel)]="customMeasurements.hips" min="1" />
                  </div>
                  <div class="measure-field">
                    <label class="measure-label">Length (cm)</label>
                    <input type="number" class="measure-input" placeholder="e.g. 120"
                           [(ngModel)]="customMeasurements.length" min="1" />
                  </div>
                </div>
              </div>
            }

            <!-- BUY NOW Button -->
            <button class="btn-buy-now"
                    [disabled]="!isOrderReady() || processingBuy"
                    (click)="onBuyNow()">
              {{ processingBuy ? 'LOADING...' : (isOrderReady() ? 'BUY NOW' : 'SELECT A SIZE') }}
            </button>

          </div>
        </div>
      }

      <!-- ===== CHECKOUT MODAL OVERLAY ===== -->
      @if (isCheckoutOpen) {
        <div class="checkout-overlay" (click)="closeCheckout()">
          <div class="checkout-card" (click)="$event.stopPropagation()">

            <!-- VIEW 1: Deliver To summary card -->
            @if (savedAddress && !showAddressForm) {
              <div>
                <h2 class="checkout-heading">Deliver To</h2>
                <p class="checkout-subtext">We found your saved delivery address.</p>

                <div class="address-summary-card">
                  <div class="address-summary-name">{{ savedAddress.name }}</div>
                  <div class="address-summary-phone">{{ savedAddress.phone }}</div>
                  <div class="address-summary-line">{{ savedAddress.address }}</div>
                  <div class="address-summary-line">{{ savedAddress.city }}, {{ savedAddress.state }} — {{ savedAddress.pincode }}</div>
                </div>

                <div style="display:flex; gap:12px; margin-top:28px;">
                  <button class="btn-ghost-co" style="flex:1;" (click)="closeCheckout()">CANCEL</button>
                  <button class="btn-use-diff" style="flex:1;" (click)="showAddressForm = true">USE DIFFERENT</button>
                  <button class="btn-co-primary" style="flex:1.5;" [disabled]="isSubmitting"
                          (click)="confirmOrder(savedAddress!)">
                    {{ isSubmitting ? 'PLACING...' : 'DELIVER HERE' }}
                  </button>
                </div>
              </div>
            }

            <!-- VIEW 2: Address form (first time or USE DIFFERENT) -->
            @if (!savedAddress || showAddressForm) {
              <div>
                <h2 class="checkout-heading">Delivery Details</h2>
                <p class="checkout-subtext">Your address is saved for future orders.</p>

                <div class="co-field-group">
                  <label class="co-label">Street Address / House No.</label>
                  <input type="text" class="co-input" placeholder="12, Rose Nagar, Kumaran Street"
                         [(ngModel)]="addrForm.shipping_address" maxlength="255" />
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="co-field-group">
                    <label class="co-label">City</label>
                    <input type="text" class="co-input" placeholder="Mayiladuthurai"
                           [(ngModel)]="addrForm.shipping_city" maxlength="100" />
                  </div>
                  <div class="co-field-group">
                    <label class="co-label">State</label>
                    <input type="text" class="co-input" placeholder="Tamil Nadu"
                           [(ngModel)]="addrForm.shipping_state" maxlength="100" />
                  </div>
                </div>

                <div class="co-field-group">
                  <label class="co-label">Pincode</label>
                  <input type="text" class="co-input" placeholder="609309"
                         [(ngModel)]="addrForm.shipping_pincode"
                         maxlength="6" pattern="[0-9]{6}" />
                </div>

                <div style="display:flex; gap:12px; margin-top:28px;">
                  <button class="btn-ghost-co" style="flex:1;" (click)="closeCheckout()">CANCEL</button>
                  <button class="btn-co-primary" style="flex:2;"
                          [disabled]="isSubmitting || !isAddrFormValid()"
                          (click)="submitAddressAndOrder()">
                    {{ isSubmitting ? 'PLACING ORDER...' : 'CONFIRM & ORDER' }}
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ===== PAGE ===== */
    .page-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at 60% 20%, #FBFBF9 0%, #F0EAE2 100%);
      font-family: 'Montserrat', sans-serif;
    }

    /* ===== NAV ===== */
    .nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 60px;
      background: var(--glass-bg, rgba(255,255,255,0.85));
      border-bottom: 1px solid #EBEBEB;
      border-top: 3px solid #D4AF37;
      backdrop-filter: blur(10px);
    }
    .back-link {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: #153A36;
      text-decoration: none;
      transition: color 0.2s;
    }
    .back-link:hover { color: #D4AF37; }
    .nav-brand {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: #153A36;
      letter-spacing: 0.1em;
    }
    .nav-tagline {
      font-size: 9px;
      letter-spacing: 0.25em;
      color: #888;
      margin-top: 3px;
    }

    /* ===== LAYOUT ===== */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      max-width: 1100px;
      margin: 0 auto;
      padding: 60px 40px;
    }

    /* ===== IMAGE ===== */
    .image-col { position: sticky; top: 30px; align-self: start; }
    .image-wrapper {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 15px 40px rgba(0,0,0,0.10);
      background: #F9F6F0;
    }
    .product-img {
      width: 100%;
      display: block;
      object-fit: cover;
      aspect-ratio: 3/4;
      transition: transform 0.5s ease;
    }
    .product-img:hover { transform: scale(1.03); }

    /* ===== INFO ===== */
    .info-col { padding-top: 10px; }

    .stock-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: 4px 10px;
      border-radius: 2px;
      margin-bottom: 14px;
      text-transform: uppercase;
    }
    .in-stock  { background: rgba(21,130,60,0.08); color: #15823C; border: 1px solid #15823C; }
    .out-of-stock { background: rgba(180,40,40,0.08); color: #B42828; border: 1px solid #B42828; }

    .product-name {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 500;
      color: #153A36;
      margin: 0 0 12px 0;
      line-height: 1.2;
    }
    .product-price {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #D4AF37;
      margin-bottom: 16px;
    }
    .product-desc {
      font-size: 13px;
      color: #666;
      line-height: 1.8;
      margin-bottom: 24px;
    }
    .gold-divider {
      height: 1px;
      background: linear-gradient(90deg, #D4AF37 0%, transparent 100%);
      margin-bottom: 28px;
    }

    /* ===== SIZE SELECTION ===== */
    .section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 14px;
    }
    .size-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .size-btn {
      width: 52px;
      height: 52px;
      border: 1px solid #DDD;
      border-radius: 2px;
      background: white;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #AAA;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .size-btn:hover { border-color: #D4AF37; color: #D4AF37; }
    .size-active {
      border: 2px solid #D4AF37 !important;
      color: #D4AF37 !important;
      background: rgba(212,175,55,0.05) !important;
    }

    /* ===== CUSTOM TOGGLE ===== */
    .custom-toggle {
      background: none;
      border: none;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      color: #153A36;
      cursor: pointer;
      padding: 0;
      letter-spacing: 0.3px;
      margin-bottom: 20px;
      text-decoration: underline;
      display: block;
      transition: color 0.2s;
    }
    .custom-toggle:hover { color: #D4AF37; }

    /* ===== CUSTOM MEASUREMENTS ===== */
    .custom-form {
      background: #FAFAF8;
      border: 1px solid #EBEBEB;
      border-left: 2px solid #D4AF37;
      padding: 20px;
      margin-bottom: 24px;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .measure-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .measure-field { display: flex; flex-direction: column; }
    .measure-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 6px;
    }
    .measure-input {
      padding: 9px 12px;
      border: none;
      border-bottom: 1px solid #DDD;
      background: transparent;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      color: #222;
      outline: none;
      transition: border-color 0.25s;
    }
    .measure-input:focus { border-bottom: 2px solid #D4AF37; }

    /* ===== BUY NOW BUTTON ===== */
    .btn-buy-now {
      width: 100%;
      padding: 16px;
      background: #2C2C2C;
      color: #D4AF37;
      border: none;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      cursor: pointer;
      margin-top: 28px;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .btn-buy-now:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); }
    .btn-buy-now:disabled { background: #E8E8E8; color: #B0B0B0; cursor: not-allowed; letter-spacing: 2px; }

    /* ===== CHECKOUT OVERLAY ===== */
    .checkout-overlay {
      position: fixed; top:0; left:0;
      width:100vw; height:100vh;
      background: rgba(0,0,0,0.55);
      z-index: 5000;
      display:flex; align-items:center; justify-content:center;
      animation: fadeOv 0.25s ease;
    }
    @keyframes fadeOv { from{opacity:0;} to{opacity:1;} }
    .checkout-card {
      background: white;
      width:100%; max-width:480px;
      padding: 44px 40px;
      border-top: 2px solid #D4AF37;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes slideUp {
      from{transform:translateY(20px);opacity:0;}
      to{transform:translateY(0);opacity:1;}
    }
    .checkout-heading {
      font-family:'Playfair Display',serif;
      font-size:26px; font-weight:500;
      color:#153A36; margin:0 0 8px 0;
    }
    .checkout-subtext {
      font-size:12px; color:#888; margin:0 0 28px 0; letter-spacing:0.3px;
    }
    .address-summary-card {
      border:1px solid #EBEBEB; border-left:3px solid #D4AF37;
      padding:18px 20px; background:#FAFAFA;
    }
    .address-summary-name { font-family:'Playfair Display',serif; font-size:16px; color:#153A36; margin-bottom:4px; }
    .address-summary-phone { font-size:12px; color:#888; margin-bottom:10px; }
    .address-summary-line { font-size:13px; color:#444; line-height:1.7; }
    .co-field-group { margin-bottom:18px; }
    .co-label {
      display:block; font-size:11px; font-weight:600;
      letter-spacing:0.8px; text-transform:uppercase;
      color:#555; margin-bottom:7px;
    }
    .co-input {
      width:100%; padding:11px 14px;
      border:1px solid #ddd; border-radius:2px;
      font-family:'Montserrat',sans-serif; font-size:13px; color:#222;
      box-sizing:border-box; outline:none;
      transition:border-color 0.25s, box-shadow 0.25s;
    }
    .co-input:focus { border-color:#D4AF37; box-shadow:0 0 0 3px rgba(212,175,55,0.1); }
    .btn-co-primary {
      padding:13px 20px;
      background:#2c2c2c; color:#D4AF37;
      border:none; border-radius:2px;
      font-family:'Montserrat',sans-serif;
      font-size:11px; font-weight:600;
      letter-spacing:2px; text-transform:uppercase;
      cursor:pointer; transition:background 0.2s, transform 0.2s;
    }
    .btn-co-primary:hover:not(:disabled) { background:#1a1a1a; transform:translateY(-1px); }
    .btn-co-primary:disabled { background:#E0E0E0; color:#A0A0A0; cursor:not-allowed; }
    .btn-use-diff {
      padding:13px 20px;
      background:transparent; color:#153A36;
      border:1px solid #153A36; border-radius:2px;
      font-family:'Montserrat',sans-serif;
      font-size:11px; font-weight:600;
      letter-spacing:1px; text-transform:uppercase;
      cursor:pointer; transition:all 0.2s;
    }
    .btn-use-diff:hover { background:#153A36; color:white; }
    .btn-ghost-co {
      padding:13px 20px;
      background:transparent; color:#999;
      border:1px solid #DDD; border-radius:2px;
      font-family:'Montserrat',sans-serif;
      font-size:11px; font-weight:600;
      letter-spacing:1px; text-transform:uppercase;
      cursor:pointer; transition:all 0.2s;
    }
    .btn-ghost-co:hover { border-color:#999; color:#555; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; gap:30px; padding:30px 20px; }
      .image-col { position: static; }
      .nav-bar { padding: 14px 20px; }
      .product-name { font-size: 28px; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private productService = inject(ProductService);
  private orderService   = inject(OrderService);
  private toastService   = inject(ToastService);

  product: Product | null = null;
  isLoading = true;

  // Size selection
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSize = '';
  showCustomForm = false;
  customMeasurements = { bust: '', waist: '', hips: '', length: '' };

  // BUY NOW loading state
  processingBuy = false;

  // Checkout modal state
  isCheckoutOpen  = false;
  showAddressForm = false;
  isSubmitting    = false;
  savedAddress: UserAddress | null = null;
  addrForm: AddressPayload = {
    shipping_address: '',
    shipping_city:    '',
    shipping_state:   '',
    shipping_pincode: ''
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: (p) => { this.product = p; this.isLoading = false; },
      error: ()  => { this.product = null; this.isLoading = false; }
    });
  }

  // ── Size helpers ──────────────────────────────────────
  selectSize(size: string) {
    this.selectedSize = size;
    if (size !== 'Custom') {
      this.showCustomForm = false;
    }
  }

  toggleCustomSize() {
    this.showCustomForm = !this.showCustomForm;
    if (this.showCustomForm) {
      this.selectedSize = 'Custom';
    } else if (this.selectedSize === 'Custom') {
      this.selectedSize = '';
    }
  }

  isOrderReady(): boolean {
    if (!this.selectedSize) return false;
    if (this.selectedSize === 'Custom') {
      return !!(
        this.customMeasurements.bust &&
        this.customMeasurements.waist &&
        this.customMeasurements.hips &&
        this.customMeasurements.length
      );
    }
    return true;
  }

  // ── BUY NOW click ──────────────────────────────────────
  onBuyNow() {
    // Auth check — redirect to login if not signed in
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('user_auth_token')
      : null;

    if (!token) {
      this.toastService.show('Please sign in to place your order.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.isOrderReady() || !this.product) return;

    this.processingBuy = true;

    this.orderService.getUserAddress().subscribe({
      next: (addr) => {
        this.processingBuy = false;
        const hasFullAddress = !!(addr.address && addr.city && addr.state && addr.pincode);
        this.savedAddress    = hasFullAddress ? addr : null;
        this.showAddressForm = !hasFullAddress;

        if (hasFullAddress) {
          this.addrForm = {
            shipping_address: addr.address!,
            shipping_city:    addr.city!,
            shipping_state:   addr.state!,
            shipping_pincode: addr.pincode!
          };
        }

        this.isCheckoutOpen = true;
      },
      error: () => {
        this.processingBuy   = false;
        this.savedAddress    = null;
        this.showAddressForm = true;
        this.isCheckoutOpen  = true;
      }
    });
  }

  closeCheckout() {
    this.isCheckoutOpen  = false;
    this.showAddressForm = false;
    this.isSubmitting    = false;
    this.savedAddress    = null;
    this.addrForm = { shipping_address:'', shipping_city:'', shipping_state:'', shipping_pincode:'' };
  }

  isAddrFormValid(): boolean {
    return !!(
      this.addrForm.shipping_address.trim() &&
      this.addrForm.shipping_city.trim() &&
      this.addrForm.shipping_state.trim() &&
      /^[0-9]{6}$/.test(this.addrForm.shipping_pincode)
    );
  }

  /** DELIVER HERE — use saved address */
  confirmOrder(address: UserAddress) {
    if (!this.product) return;
    this.isSubmitting = true;

    const payload: AddressPayload = {
      shipping_address: address.address!,
      shipping_city:    address.city!,
      shipping_state:   address.state!,
      shipping_pincode: address.pincode!
    };

    this.placeOrderApi(payload);
  }

  /** CONFIRM & ORDER — use form address */
  submitAddressAndOrder() {
    if (!this.product || !this.isAddrFormValid()) return;
    this.isSubmitting = true;
    this.placeOrderApi(this.addrForm);
  }

  private placeOrderApi(address: AddressPayload) {
    if (!this.product) return;

    const payload: AddressPayload = {
      ...address,
      selected_size:       this.selectedSize,
      custom_measurements: this.selectedSize === 'Custom'
        ? JSON.stringify(this.customMeasurements)
        : null
    };

    this.orderService.placeOrder(this.product.id, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeCheckout();
        this.toastService.show('✨ Order placed! Tracking will be available once dispatched.');
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.show('⚠️ Failed to place order. Please try again.');
      }
    });
  }
}
