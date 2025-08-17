
import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from './services/auth';
import { Notifications } from './services/notifications';
import { Messages } from './services/messages';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(
    private authService: Auth,
    private notificationsService: Notifications,
    private messagesService: Messages
  ) {}

  get isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get unreadNotificationsCount() {
    return this.notificationsService.unreadCount;
  }

  get totalUnreadMessages() {
    return this.messagesService.totalUnreadCount;
  }

  logout() {
    this.authService.logout();
  }
}
