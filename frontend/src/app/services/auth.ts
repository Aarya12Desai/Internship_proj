import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_BASE_URL = 'http://localhost:8081/api';
  private isLoggedInSignal = signal<boolean>(false);
  private currentUserSignal = signal<any>(null);
  private tokenSignal = signal<string | null>(null);

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only access localStorage on the browser
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) {
        this.currentUserSignal.set(JSON.parse(savedUser));
        this.tokenSignal.set(savedToken);
        this.isLoggedInSignal.set(true);
      }
    }
  }

  get isLoggedIn() {
    return this.isLoggedInSignal();
  }

  get currentUser() {
    return this.currentUserSignal();
  }

  get token() {
    return this.tokenSignal();
  }

  private getHttpHeaders(): HttpHeaders {
    const token = this.tokenSignal();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    
    return this.http.post<any>(`${this.API_BASE_URL}/auth/login`, loginData, {
      headers: this.getHttpHeaders()
    }).pipe(
      map(response => {
        if (response && response.token) {
          const user = {
            email: response.email,
            username: response.username,
            role: response.role,
            loginTime: new Date().toISOString()
          };
          
          this.currentUserSignal.set(user);
          this.tokenSignal.set(response.token);
          this.isLoggedInSignal.set(true);
          
          // Only access localStorage on the browser
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('token', response.token);
          }
          
          // Redirect to home page
          this.router.navigate(['/home']);
          return response;
        }
        throw new Error('Invalid login response');
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Call backend logout endpoint if token exists
    if (this.tokenSignal()) {
      this.http.post(`${this.API_BASE_URL}/auth/logout`, {}, {
        headers: this.getHttpHeaders()
      }).subscribe({
        next: () => console.log('Logged out from server'),
        error: (error) => console.error('Logout error:', error)
      });
    }

    this.isLoggedInSignal.set(false);
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    
    // Only access localStorage on the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    
    this.router.navigate(['/']);
  }

  signup(username: string, email: string, password: string): Observable<any> {
    const signupData = { username, email, password };
    
    return this.http.post<any>(`${this.API_BASE_URL}/auth/register`, signupData, {
      headers: this.getHttpHeaders()
    }).pipe(
      map(response => {
        console.log('Signup successful:', response);
        // After successful signup, we need to login separately
        // Return the signup response, and handle login in the component
        return response;
      }),
      catchError(error => {
        console.error('Signup error:', error);
        return throwError(() => error);
      })
    );
  }

  // Test API connection
  testConnection(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/test/all`).pipe(
      catchError(error => {
        console.error('API connection test failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Get user profile (requires authentication)
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/users/profile`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(error => {
        console.error('Get user profile failed:', error);
        return throwError(() => error);
      })
    );
  }
}
