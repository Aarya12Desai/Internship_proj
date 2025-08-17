
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

  constructor(private authService: Auth) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    const success = this.authService.signup(this.name, this.email, this.password);
    if (!success) {
      this.errorMessage = 'Signup failed. Please try again.';
    }
    // If successful, the auth service will handle navigation
  }
}
