import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../services/post.service';
import { Post } from '../models/post.model';
import { CommentsComponent } from './comments.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, CommentsComponent],
  template: `
    <article class="post">
      <!-- Post Header -->
      <div class="post-header">
        <div class="post-author">
          <div class="avatar">
            {{ post.authorUsername.charAt(0).toUpperCase() }}
          </div>
          <div class="author-info">
            <h4>{{ post.authorUsername }}</h4>
            <p class="post-time">{{ getRelativeTime(post.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Post Content -->
      <div class="post-content">
        <p>{{ post.content }}</p>
  <img *ngIf="post.imageUrl && !imageLoadError" [src]="resolveImageUrl(post.imageUrl)" (error)="onImageError()" alt="Post image" class="post-image">
      </div>

      <!-- Post Stats -->
      <div class="post-stats">
        <span *ngIf="post.likesCount > 0">{{ post.likesCount }} likes</span>
        <span *ngIf="post.commentsCount > 0">{{ post.commentsCount }} comments</span>
        <span *ngIf="post.sharesCount > 0">{{ post.sharesCount }} shares</span>
      </div>

      <!-- Post Actions -->
      <div class="post-actions">
        <button 
          class="action-btn like-btn" 
          [class.liked]="post.isLikedByCurrentUser"
          [disabled]="isLiking"
          (click)="onLike()">
          <span class="heart">{{ post.isLikedByCurrentUser ? '❤️' : '🤍' }}</span>
          {{ post.isLikedByCurrentUser ? 'Unlike' : 'Like' }}
        </button>
        
        <button class="action-btn comment-btn" (click)="toggleComments()">
          💬 Comment
        </button>
        
        <button class="action-btn share-btn">
          🔄 Share
        </button>
      </div>

      <!-- Comments Section -->
      <app-comments 
        *ngIf="showComments" 
        [postId]="post.id"
        class="comments-section">
      </app-comments>
    </article>
  `,
  styles: [`
    .post {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }

    .post-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    .author-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .post-time {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #666;
    }

    .post-content {
      padding: 16px;
    }

    .post-content p {
      margin: 0 0 12px 0;
      line-height: 1.5;
      color: #333;
    }

    .post-image {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      border-radius: 8px;
      margin-top: 12px;
    }

    .post-stats {
      padding: 8px 16px;
      font-size: 13px;
      color: #666;
      border-bottom: 1px solid #f0f0f0;
    }

    .post-stats span {
      margin-right: 16px;
    }

    .post-actions {
      display: flex;
      padding: 8px;
    }

    .action-btn {
      flex: 1;
      padding: 12px 8px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      transition: all 0.2s ease;
      border-radius: 6px;
      margin: 0 4px;
    }

    .action-btn:hover {
      background: #f8f9fa;
      color: #333;
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .like-btn.liked {
      color: #e91e63;
    }

    .like-btn.liked .heart {
      animation: heartBeat 0.6s ease;
    }

    @keyframes heartBeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }

    .comments-section {
      border-top: 1px solid #f0f0f0;
    }
  `]
})
export class PostComponent {
  @Input() post!: Post;
  @Output() postUpdated = new EventEmitter<Post>();

  showComments = false;
  isLiking = false;
  imageLoadError = false;

  constructor(private postService: PostService) {}

  onLike() {
    if (this.isLiking) return;
    
    this.isLiking = true;
    this.postService.toggleLike(this.post.id).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
        this.postUpdated.emit(updatedPost);
        this.isLiking = false;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.isLiking = false;
        if (error.status === 401) {
          alert('Please log in to like posts.');
        } else {
          alert('Failed to update like. Please try again.');
        }
      }
    });
  }

  toggleComments() {
    this.showComments = !this.showComments;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post']) {
      // reset image error state when a new post is loaded
      this.imageLoadError = false;
    }
  }

  /**
   * Resolve an image URL. If the URL points to a Wikipedia/File page (contains '/wiki/File:'),
   * convert it to a direct file path which redirects to the real image binary via
   * Special:FilePath. Otherwise return the original URL.
   */
  resolveImageUrl(url: string | undefined): string | undefined {
    if (!url) return url;
    try {
      const u = url.trim();
      // Example page URL: https://en.wikipedia.org/wiki/File:Example.jpg
      const wikiFileIndex = u.indexOf('/wiki/File:');
      if (wikiFileIndex !== -1) {
        // extract the filename after '/wiki/File:' and build a Special:FilePath URL
        const filename = u.substring(wikiFileIndex + '/wiki/File:'.length);
        // Use Wikimedia Commons Special:FilePath which redirects to the raw image
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
      }

      // If the URL is a Wikipedia page that links to media on upload.wikimedia.org but not /wiki/File,
      // sometimes pages include direct links to /w/index.php?title=File:...; handle that as well.
      const wpFileParam = u.match(/title=File:(.+)$/i);
      if (wpFileParam && wpFileParam[1]) {
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(wpFileParam[1])}`;
      }

      // Otherwise return the original URL unchanged
      return u;
    } catch (err) {
      console.warn('Failed to resolve image URL', url, err);
      return url;
    }
  }

  onImageError() {
    // hide the image if it fails to load
    this.imageLoadError = true;
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString();
  }
}