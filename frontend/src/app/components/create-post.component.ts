import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../services/post.service';
import { Auth } from '../services/auth';
import { CreatePostRequest, Post } from '../models/post.model';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-post-card">
      <div class="create-post-header">
        <div class="user-avatar">{{ getCurrentUserInitial() }}</div>
        <textarea 
          [(ngModel)]="postContent" 
          placeholder="What's on your mind?"
          class="post-textarea"
          rows="3"
          maxlength="500">
        </textarea>
      </div>
      
      <div class="image-upload-section" *ngIf="showImageUpload">
        <input 
          type="url" 
          [(ngModel)]="imageUrl" 
          placeholder="Enter image URL..."
          class="image-url-input">
        <div class="image-preview" *ngIf="imageUrl && !previewImageError">
          <img [src]="resolveImageUrl(imageUrl)" (error)="onPreviewImageError()" alt="Image preview" class="preview-image">
          <button type="button" class="remove-image-btn" (click)="removeImage()">×</button>
        </div>
        <div class="image-preview error" *ngIf="imageUrl && previewImageError">
          <div style="color:#e0245e; padding:8px;">Image preview failed to load. The link may not be a direct image or requires authentication.</div>
          <div style="margin-top:8px; display:flex; gap:8px; align-items:center;">
            <button type="button" class="option-btn" (click)="attemptConvertAndPreview()">Try convert link</button>
            <button type="button" class="option-btn" (click)="removeImage()">Remove</button>
            <div style="font-size:12px; color:#657786;">If conversion fails, try a direct image URL (ends with .jpg/.png) or upload to a public host.</div>
          </div>
        </div>
      </div>
      
      <div class="create-post-actions">
        <div class="post-options">
          <button 
            type="button" 
            class="option-btn" 
            (click)="toggleImageUpload()"
            [class.active]="showImageUpload">
            🖼️ Photo
          </button>
          <span class="character-count" [class.warning]="postContent.length > 450">
            {{ postContent.length }}/500
          </span>
        </div>
        
        <button 
          type="button" 
          class="post-btn" 
          (click)="createPost()"
          [disabled]="!canPost()"
          [class.loading]="isLoading">
          {{ isLoading ? 'Posting...' : 'Post' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .create-post-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid #e1e8ed;
    }

    .create-post-header {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
      flex-shrink: 0;
    }

    .post-textarea {
      flex: 1;
      border: none;
      resize: none;
      font-size: 16px;
      font-family: inherit;
      outline: none;
      padding: 12px 0;
      line-height: 1.5;
      min-height: 60px;
    }

    .post-textarea::placeholder {
      color: #657786;
      font-size: 18px;
    }

    .image-upload-section {
      margin-bottom: 15px;
    }

    .image-url-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 10px;
    }

    .image-url-input:focus {
      outline: none;
      border-color: #1da1f2;
      box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.1);
    }

    .image-preview {
      position: relative;
      display: inline-block;
      max-width: 100%;
    }

    .preview-image {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      object-fit: cover;
    }

    .remove-image-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .remove-image-btn:hover {
      background: rgba(0,0,0,0.9);
    }

    .create-post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #e1e8ed;
    }

    .post-options {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .option-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      color: #1da1f2;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .option-btn:hover,
    .option-btn.active {
      background-color: rgba(29, 161, 242, 0.1);
    }

    .character-count {
      font-size: 12px;
      color: #657786;
      font-weight: 500;
    }

    .character-count.warning {
      color: #e0245e;
    }

    .post-btn {
      background: #1da1f2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      min-width: 80px;
    }

    .post-btn:hover:not(:disabled) {
      background: #1991da;
    }

    .post-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .post-btn.loading {
      opacity: 0.7;
    }
  `]
})
export class CreatePostComponent {
  @Output() postCreated = new EventEmitter<Post>();

  postContent = '';
  imageUrl = '';
  showImageUpload = false;
  isLoading = false;
  previewImageError = false;

  /** Attempted converted URL cached to avoid repeated failures */
  private lastAttemptedConversion?: string;

  constructor(
    private postService: PostService,
    private auth: Auth
  ) {}

  toggleImageUpload() {
    this.showImageUpload = !this.showImageUpload;
    if (!this.showImageUpload) {
      this.imageUrl = '';
    }
  }

  removeImage() {
    this.imageUrl = '';
  }

  canPost(): boolean {
    return this.postContent.trim().length > 0 && 
           this.postContent.length <= 500 && 
           !this.isLoading;
  }

  createPost() {
    if (!this.canPost()) return;

    this.isLoading = true;

    const normalized = this.normalizeImageUrl(this.imageUrl);
    const request: CreatePostRequest = {
      content: this.postContent.trim(),
      imageUrl: normalized || undefined
    };

    console.log('Creating post with request:', request);

    this.postService.createPost(request).subscribe({
      next: (post) => {
        console.log('Post created successfully:', post);
        this.postCreated.emit(post);
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating post:', error);
        alert(`Error creating post: ${error.error?.message || error.message || 'Unknown error'}`);
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    this.postContent = '';
    this.imageUrl = '';
  this.previewImageError = false;
    this.showImageUpload = false;
  }

  getCurrentUserInitial(): string {
    const user = this.auth.currentUser;
    if (user && user.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  }

  onPreviewImageError() {
    this.previewImageError = true;
  }

  /**
   * Convert known sharing URLs to a direct image URL suitable for <img src=>.
   * Handles Google Drive `/file/d/ID` and `/open?id=ID` patterns.
   */
  normalizeImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    const u = url.trim();

    try {
      // Google Drive file link: /file/d/FILEID
      const driveFileMatch = u.match(/drive\.google\.com\/file\/d\/([-_a-zA-Z0-9]+)/);
      if (driveFileMatch && driveFileMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
      }

      const openIdMatch = u.match(/[?&]id=([-_a-zA-Z0-9]+)/);
      if (u.includes('drive.google.com') && openIdMatch && openIdMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${openIdMatch[1]}`;
      }

      // Common Google redirect links include url?q=ACTUAL_URL or /imgres?imgurl=ACTUAL_URL
      const urlQ = u.match(/[?&]url=([^&]+)/) || u.match(/url\?q=([^&]+)/);
      if (urlQ && urlQ[1]) {
        try {
          return decodeURIComponent(urlQ[1]);
        } catch (_) {
          return urlQ[1];
        }
      }

      const imgres = u.match(/imgres\?imgurl=([^&]+)/);
      if (imgres && imgres[1]) {
        try { return decodeURIComponent(imgres[1]); } catch (_) { return imgres[1]; }
      }

      const imgurlParam = u.match(/[?&]imgurl=([^&]+)/);
      if (imgurlParam && imgurlParam[1]) {
        try { return decodeURIComponent(imgurlParam[1]); } catch (_) { return imgurlParam[1]; }
      }

      // Google redirect pattern used in search result link sharing (e.g., /url?q=...&sa=...)
      const urlQ2 = u.match(/\/url\?q=([^&]+)/);
      if (urlQ2 && urlQ2[1]) {
        try { return decodeURIComponent(urlQ2[1]); } catch (_) { return urlQ2[1]; }
      }

      // If it already looks like a gstatic/googleusercontent/encrypted thumbnail, return as-is
      if (u.includes('gstatic.com') || u.includes('googleusercontent.com') || u.includes('encrypted-tbn0')) {
        return u;
      }

      return u;
    } catch (err) {
      console.warn('normalizeImageUrl error', err);
      return u;
    }
  }

  resolveImageUrl(url: string | undefined): string | undefined {
    return this.normalizeImageUrl(url);
  }

  /** Try to auto-convert the pasted link (useful for Google Image search links). */
  attemptConvertAndPreview() {
    if (!this.imageUrl) return;
    const converted = this.normalizeImageUrl(this.imageUrl);
    // Avoid looping on the same failed conversion
    if (this.lastAttemptedConversion === converted) {
      // already tried
      return;
    }
    this.lastAttemptedConversion = converted;
    if (converted && converted !== this.imageUrl) {
      this.imageUrl = converted;
      this.previewImageError = false;
      // small delay lets the img element pick up the new src
      setTimeout(() => {
        // nothing else; browser will trigger error or success
      }, 200);
    } else {
      // try extracting imgurl from query parameters explicitly
      const alt = this.normalizeImageUrl(this.imageUrl);
      if (alt && alt !== this.imageUrl) {
        this.imageUrl = alt;
        this.previewImageError = false;
      }
    }
  }
}
