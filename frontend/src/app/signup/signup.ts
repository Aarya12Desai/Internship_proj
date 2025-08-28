
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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
  role: 'student' | 'company' = 'student';

  // student fields
  firstName = '';
  lastName = '';
  rollNumber = '';

  // company fields
  companyName = '';
  companyWebsite = '';
  companyContactName = '';
  companyContactPhone = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: Auth, private router: Router, private route: ActivatedRoute) {
  // Determine role from route data, route param, or query param (in that order)
  const dataType = this.route.snapshot.data?.['type'];
  const paramType = this.route.snapshot.paramMap.get('type');
  const qType = this.route.snapshot.queryParamMap.get('type');
  const type = dataType || paramType || qType;
  if (type === 'company') this.role = 'company';
  else this.role = 'student';
  }

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
      // Now automatically login
      this.authService.login(this.email, this.password).subscribe({
        next: (loginResponse) => {
          console.log('Auto-login successful:', loginResponse);
          this.isLoading = false;
          setTimeout(() => { this.router.navigate(['/home']); }, 100);
        },
        error: (loginError) => {
          console.error('Auto-login failed:', loginError);
          this.isLoading = false;
          this.errorMessage = 'Account created successfully, but auto-login failed. Please login manually.';
        }
      });
    };

    const onError = (error: any) => {
      console.error('Signup failed:', error);
      this.isLoading = false;
      if (error.status === 400) {
        this.errorMessage = error.error?.message || 'User already exists or invalid data';
      } else if (error.status === 0) {
        this.errorMessage = 'Unable to connect to server. Please try again.';
      } else {
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    };

    if (this.role === 'student') {
      if (!this.firstName || !this.lastName || !this.rollNumber) {
        this.errorMessage = 'Please fill in all student fields';
        this.isLoading = false;
        return;
      }
      this.authService.signupStudent(this.name, this.email, this.password, this.firstName, this.lastName, this.rollNumber)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      if (!this.companyName) {
        this.errorMessage = 'Please provide company name';
        this.isLoading = false;
        return;
      }
  this.authService.signupCompany(this.name, this.email, this.password, this.companyName, this.companyWebsite, this.companyContactName, this.companyContactPhone)
        .subscribe({ next: onSuccess, error: onError });
    }
  }
}
