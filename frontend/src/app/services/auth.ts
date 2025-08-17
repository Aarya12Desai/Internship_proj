import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private isLoggedInSignal = signal<boolean>(false);
  private currentUserSignal = signal<any>(null);

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only access localStorage on the browser
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSignal.set(JSON.parse(savedUser));
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

  login(email: string, password: string): boolean {
    // Simple authentication logic (replace with real API call)
    if (email && password) {
      const user = {
        email: email,
        name: email.split('@')[0],
        loginTime: new Date().toISOString()
      };
      
      this.currentUserSignal.set(user);
      this.isLoggedInSignal.set(true);
      
      // Only access localStorage on the browser
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      // Redirect to home page
      this.router.navigate(['/home']);
      return true;
    }
    return false;
  }

  logout(): void {
    this.isLoggedInSignal.set(false);
    this.currentUserSignal.set(null);
    
    // Only access localStorage on the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    
    this.router.navigate(['/']);
  }

  signup(name: string, email: string, password: string): boolean {
    // Simple signup logic (replace with real API call)
    if (name && email && password) {
      const user = {
        name: name,
        email: email,
        loginTime: new Date().toISOString()
      };
      
      this.currentUserSignal.set(user);
      this.isLoggedInSignal.set(true);
      
      // Only access localStorage on the browser
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      // Redirect to home page
      this.router.navigate(['/home']);
      return true;
    }
    return false;
  }
}
