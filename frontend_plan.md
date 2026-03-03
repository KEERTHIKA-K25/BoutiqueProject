# Frontend Initialization (Mission 3) Implementation Plan

## 1. Angular Workspace Initialization
We will run the following command inside the `d:\BoutiqueProject\frontend` directory to generate the Angular 19 application:
```bash
npx -y @angular/cli@19 new boutique-frontend --routing --style=css --minimal --directory=./
```
*Note: Using `--directory=./` ensures the application is created directly in the existing `/frontend` folder, rather than creating a nested `frontend/boutique-frontend` folder.*

## 2. Environment Configuration
We will create an environment file to hold the URL for your Laravel backend.

**`frontend/src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## 3. Creating the AuthService
We will generate a new service that connects to the Laravel backend. Since this is Angular 19, we will use the newer `inject(HttpClient)` pattern, which works perfectly with standalone components.

**`frontend/src/app/services/auth.service.ts`**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
}
```

## 4. App Configuration (Standalone & Reactive Forms)
In Angular Standalone applications, we provide global modules in `app.config.ts` and import component-specific modules (like `ReactiveFormsModule`) directly into the components using them.

**`frontend/src/app/app.config.ts`**
We will configure the HTTP client globally:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

**`frontend/src/app/app.component.ts`**
We will ensure `ReactiveFormsModule` is imported into the standalone component structure so you can easily build forms later:
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule],
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'boutique-frontend';
}
```

## Review Request
Please review this implementation plan. If approved, I will run the Angular CLI to initialize the minimal project and write out the `AuthService` and environment configurations!
