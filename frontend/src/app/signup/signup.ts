
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: Auth) {}

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

    this.authService.signup(this.name, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        // Now automatically login
        this.authService.login(this.email, this.password).subscribe({
          next: (loginResponse) => {
            console.log('Auto-login successful:', loginResponse);
            this.isLoading = false;
          },
          error: (loginError) => {
            console.error('Auto-login failed:', loginError);
            this.isLoading = false;
            this.errorMessage = 'Account created successfully, but auto-login failed. Please login manually.';
          }
        });
      },
      error: (error) => {
        console.error('Signup failed:', error);
        this.isLoading = false;
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'User already exists or invalid data';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again.';
        } else {
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
        }
      }
    });
  }
}
