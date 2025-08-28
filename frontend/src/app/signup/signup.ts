
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  name = '';
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: Auth, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      this.isLoading = false;
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.isLoading = false;
      return;
    }

    const onSuccess = (response: any) => {
      console.log('Signup successful:', response);
      // Auto-login after signup
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (loginError: any) => {
          console.error('Auto-login failed:', loginError);
          this.isLoading = false;
          this.errorMessage = 'Account created, please login.';
        }
      });
    };

    const onError = (error: any) => {
      console.error('Signup failed:', error);
      this.isLoading = false;
      if (error?.status === 400) {
        this.errorMessage = error.error?.message || 'User already exists or invalid data';
      } else if (error?.status === 0) {
        this.errorMessage = 'Unable to connect to server. Please try again.';
      } else {
        this.errorMessage = error?.error?.message || 'Signup failed. Please try again.';
      }
    };

    this.authService.signup(this.name, this.email, this.password).subscribe({ next: onSuccess, error: onError });
  }
}
          // this.router.navigate(['/home']);
