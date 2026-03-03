# Final Mission: Full System Integration (Admin + Shiprocket + SMS OTP)

This plan outlines the final full-stack integration to bring the Boutique application to a live-ready state, implementing real third-party API communication, an exclusive Admin portal, and an OTP-secured registration flow!

## 1. OTP-Secured Registration Flow (SMS Simulation)

**Backend (Laravel):**
- **Migration**: We will add `phone` (string), `otp` (string), and `otp_verified_at` (timestamp) columns to the `users` table.
- **AuthController**: 
  - Update `register()` to generate a 6-digit random OTP, save it securely in the database, and log `"[OTP] To: {phone} - Your Boutique verification code is: {OTP}"`.
  - The API will log the user in but mark them as unverified.
  - Create a new endpoint `POST /verify-otp` to validate the code and update `otp_verified_at`.

**Frontend (Angular):**
- Add a Mobile Number field to the `RegisterComponent`.
- Create a new `VerifyOtpComponent`. After successful registration, the user is routed to `/verify-otp`.
- We will implement an Angular Route Guard (`AuthGuard`) to prevent unverified users from accessing `/dashboard` or `/my-orders`.

---

## 2. Live Shiprocket API Integration

**Backend (`ShiprocketController`)**:
- We will rewrite `createShipment()` to act as a real HTTP proxy. 
- It will first securely authenticate using your `.env` `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` to obtain an active ephemeral Bearer token from `apiv2.shiprocket.in/v1/external/auth/login`.
- It will instantly fire a POST to `apiv2.shiprocket.in/v1/external/orders/create/ad-hoc` using the dynamic Order details and the hardcoded boutique box dimensions: Length (10cm), Width (15cm), Height (10cm), Weight (0.5kg).
- It returns the actual `order_id` & `shipment_id` supplied by the live API.

---

## 3. The Admin Delivery Portal

**Backend**:
- Since Shiprocket usually assigns an AWB (Airway Bill) code *after* a courier is assigned, we will build a backend Admin flow.
- **Models & Migration**: Add an `awb_code` column to the `orders` table.
- **AdminController**: Create endpoints for fetching all orders and updating the AWB code manually: `POST /api/admin/orders/{id}/awb`.

**Frontend (`AdminOrdersComponent`)**:
- We will build an `/admin/orders` page.
- It will contain a sleek HTML table listing all system orders.
- Each row will feature a text input for the `AWB Code` paired with a stylish "Save AWB" ghost button.
- Saving it updates the database, shifting the user's view from "pending" to actively trackable!

---

## 4. Vertical Tracking Timeline (Live Roadmap)

**Backend**:
- Update `ShiprocketController@getTrackingDetails($awb)`.
- It will hit the live Shiprocket API: `GET https://apiv2.shiprocket.in/v1/external/courier/track/awb/{$awb}` using the dynamically refreshed auth token.
- We will extract and return the `tracking_data.track_activities` array containing live checkpoints.

**Frontend (`MyOrdersComponent`)**:
- When the user clicks "Track", instead of an `alert()`, a smooth vertical timeline UI will expand below the order row (or in a modal).
- Using Angular's `*ngFor` and a beautiful CSS pseudo-element line (`::before`), we will draw a connected roadmap showing every milestone (e.g., "Picked Up", "In Transit", "Out for Delivery") with timestamps!
- If the Admin has *not* entered an AWB code yet, the button will cleanly display "Processing" instead of "Track".

## Review Request
Please review this architecture. Notice how the user flow is completely locked until the OTP is read from `laravel.log`, and how the live AWB code typed by the Admin magically unlocks the real-time Vertical Timeline feature. 

If this plan is approved, we will begin executing the database migrations and the live Shiprocket logic!
