# Mission 11: Real-Time External AWB Tracking Implementation Plan

## Step 1: Backend Service Implementation (Laravel)
I will update the `getTrackingDetails` method in `App\Http\Controllers\Api\ShiprocketController.php`. 
- First, I will authenticate to get the `Bearer` token using the `.env` credentials.
- Then, I will make a `POST` request to `https://apiv2.shiprocket.in/v1/external/courier/track/awbs` with the payload `{"awbs": ["{awb_code}"]}` based on the blueprint.
- I will parse the response to safely return `tracking_data`. Since Shiprocket `awbs` API usually wraps the results by track ID, I'll extract it dynamically to match your blueprint structure so Angular can read `shipment_track_activities`.

## Step 2: Admin Dashboard Update (Angular / Laravel)
- The backend `AdminController` already has an endpoint `POST /admin/orders/{id}/awb` that saves the AWB to the database and marks the order as `'shipped'`. 
- The Angular `AdminOrdersComponent` already calls this successfully. I will double-check to ensure that once this AWB is saved, the timeline in `MyOrdersComponent` is fully unlocked.

## Step 3: Frontend Vertical Timeline UI (Angular)
I will update `MyOrdersComponent` to render the actual live timeline.
The Angular component variable will capture `shipment_track_activities`.
The template will iterate over these activities, formatting dates properly, and using conditional classes to color the dot.

### Frontend HTML Template Blueprint
```html
<td style="width: 350px;">
  <div style="display: flex; flex-direction: column; gap: 10px;">
    
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-family: monospace; color: #666;">{{ order.awb_code || order.tracking_id || 'N/A' }}</span>
      <button *ngIf="order.awb_code" class="btn-ghost btn-small" (click)="trackOrder(order)">
        {{ trackingOrder === order.id ? 'Loading...' : 'Track' }}
      </button>
      <button *ngIf="!order.awb_code && order.tracking_id" class="btn-ghost btn-small" disabled title="Pending Admin AWB">
        Processing
      </button>
    </div>
    
    <!-- Timeline Container -->
    <div class="timeline-container" *ngIf="trackingActivities[order.id]">
      <div *ngIf="trackingActivities[order.id].length === 0" style="font-size: 12px; color: #999;">
        Waiting for courier update...
      </div>
      
      <div class="timeline-item" *ngFor="let activity of trackingActivities[order.id]; let i = index">
        <!-- Colored Dot: Green for the latest/current (i===0), Grey for past events -->
        <div class="timeline-dot" [ngClass]="{'dot-active': i === 0, 'dot-past': i > 0}"></div>
        
        <div class="timeline-content">
          <div class="timeline-activity" [style.color]="i === 0 ? 'var(--secondary-color)' : '#666'">
            {{ activity.activity }}
          </div>
          <div class="timeline-location" style="font-size: 11px; color: #888; margin-top: 2px;">
             {{ activity.location }}
          </div>
          <div class="timeline-date">
             {{ activity.date | date:'dd MMM, h:mm a' }}
          </div>
        </div>
      </div>
      
    </div>
  </div>
</td>
```

### Required CSS Updates
I'll also append these classes in the styles array for `MyOrdersComponent`:
```css
.dot-active {
  background-color: #2e7d32; /* Rich Green */
  border: 2px solid #e8f5e9;
  box-shadow: 0 0 0 2px #4caf5040;
}
.dot-past {
  background-color: #bdbdbd; /* Soft Grey */
  border: 2px solid white;
}
```
