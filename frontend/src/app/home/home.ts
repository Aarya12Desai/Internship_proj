import { Component } from '@angular/core';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  
  constructor(private authService: Auth) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  logout(): void {
    this.authService.logout();
  }
}
