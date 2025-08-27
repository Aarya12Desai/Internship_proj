import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../services/post.service';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { Post } from '../models/post.model';
import { CreatePostComponent } from './create-post.component';
import { PostComponent } from './post.component';

@Component({
  selector: 'app-posts-feed',
  standalone: true,
  imports: [CommonModule, CreatePostComponent, PostComponent],
  template: `
    <div class="posts-feed">
      <!-- Create Post Section -->
      <app-create-post (postCreated)="onPostCreated($event)"></app-create-post>
      
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
      
      <!-- Posts List -->
      <div *ngIf="!isLoading" class="posts-list">
        <app-post 
          *ngFor="let post of posts" 
          [post]="post"
          (postUpdated)="onPostUpdated($event)">
        </app-post>
        
        <!-- Empty State -->
        <div *ngIf="posts.length === 0" class="empty-state">
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .posts-feed {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .loading-container {
      text-align: center;
      padding: 40px;
    }
    
    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .posts-list {
      margin-top: 20px;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .empty-state h3 {
      margin-bottom: 10px;
      color: #333;
    }
  `]
})
export class PostsFeedComponent implements OnInit {
  posts: Post[] = [];
  isLoading = false;

  constructor(
    private postService: PostService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    // Simple authentication check without token validation
    if (!this.auth.isLoggedIn || !this.auth.token) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    // Load posts directly
    this.loadPosts();
  }

  private loadPosts() {
    this.isLoading = true;
    this.postService.getAllPosts().subscribe({
      next: (response) => {
        this.posts = response.content; // Extract the content array from PostsResponse
        this.isLoading = false;
        console.log('Posts loaded successfully:', response.content.length, 'posts');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading posts:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Handle specific authentication errors - but don't auto-logout on 403
        if (error.status === 401) {
          console.log('401 error - session expired');
          this.auth.logout();
        } else if (error.status === 403) {
          console.log('403 error - access forbidden, but not logging out automatically');
          console.log('This might be a token/authorization issue that needs investigation');
        } else if (error.error && typeof error.error === 'string' && error.error.includes('<!DOCTYPE')) {
          console.log('HTML response received - likely server error');
          // Don't auto-logout for HTML responses, could be server issues
        } else {
          // For other errors, don't logout
          console.log('Non-auth error, not logging out');
        }
      }
    });
  }

  onPostCreated(newPost: Post) {
    this.posts.unshift(newPost);
  }

  onPostUpdated(updatedPost: Post) {
    const index = this.posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
    }
  }
}