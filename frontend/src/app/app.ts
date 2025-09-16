

import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Auth } from './services/auth';
import { Notifications } from './services/notifications';
import { Messages } from './services/messages';
import { CreateProjectComponent } from './components/create-project.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, FormsModule, CommonModule, AsyncPipe, CreateProjectComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(
    public authService: Auth,
    private notificationsService: Notifications,
    private messagesService: Messages,
    private router: Router
  ) {}


  showCreateProject = false;

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


  getUserRole(): string | null {
    const user = this.authService.currentUser;
    return user ? user.role : null;
  }

  openCompanyCommunityChat() {
    // Try to get company community info from localStorage
    const companyCommunityId = localStorage.getItem('company_community_id');
    const companyCommunityName = localStorage.getItem('company_community_name');
    
    if (companyCommunityId && companyCommunityName) {
      // Use the stored community info
      localStorage.setItem('active_community_id', companyCommunityId);
      localStorage.setItem('active_community_name', companyCommunityName);
      this.router!.navigate(['/community-chat']);
    } else {
      // Fallback: navigate with placeholder and let community-chat component handle finding the right community
      const fallbackName = localStorage.getItem('company_name') || 'Company Community';
      localStorage.setItem('active_community_id', '0'); // Temporary placeholder
      localStorage.setItem('active_community_name', fallbackName);
      localStorage.setItem('find_company_community', 'true'); // Flag for community-chat component
      this.router!.navigate(['/community-chat']);
    }
  }
}
