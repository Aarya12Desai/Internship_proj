import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(private authService: Auth, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn) {
      return true;
    } else {
      // User is already logged in, redirect to home page
      this.router.navigate(['/home']);
      return false;
    }
  }
}
