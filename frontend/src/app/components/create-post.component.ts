import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../services/post.service';
import { Auth } from '../services/auth';
import { CreatePostRequest, Post } from '../models/post.model';
import { HttpClient } from '@angular/common/http';

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
        <div class="file-input-wrapper">
          <input 
            type="file" 
            #fileInput
            (change)="onFileSelected($event)"
            accept="image/*"
            class="file-input"
            id="imageFile">
          <label for="imageFile" class="file-input-label">
            📷 Choose Image
          </label>
          <span class="file-info" *ngIf="selectedFile">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
        </div>
        
        <div class="image-preview" *ngIf="imagePreviewUrl">
          <img [src]="imagePreviewUrl" alt="Image preview" class="preview-image">
          <button type="button" class="remove-image-btn" (click)="removeImage()">×</button>
        </div>
        
        <div class="upload-guidelines">
          <small>Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB</small>
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

    .file-input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .file-input {
      display: none;
    }

    .file-input-label {
      background: #f7f9fa;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #1da1f2;
      transition: all 0.2s;
      display: inline-block;
    }

    .file-input-label:hover {
      background: #e8f5fe;
      border-color: #1da1f2;
    }

    .file-info {
      font-size: 12px;
      color: #657786;
      flex: 1;
    }

    .image-preview {
      position: relative;
      display: inline-block;
      max-width: 100%;
      margin-bottom: 10px;
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
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .remove-image-btn:hover {
      background: rgba(0, 0, 0, 0.9);
    }

    .upload-guidelines {
      color: #657786;
      font-size: 12px;
      margin-top: 8px;
    }

    .create-post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .post-options {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .option-btn {
      background: none;
      border: none;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      color: #1da1f2;
      transition: background-color 0.2s;
    }

    .option-btn:hover, .option-btn.active {
      background: rgba(29, 161, 242, 0.1);
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
  showImageUpload = false;
  isLoading = false;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  constructor(
    private postService: PostService,
    private auth: Auth,
    private http: HttpClient
  ) {}

  toggleImageUpload() {
    this.showImageUpload = !this.showImageUpload;
    if (!this.showImageUpload) {
      this.removeImage();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB.');
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  canPost(): boolean {
    return this.postContent.trim().length > 0 && 
           this.postContent.length <= 500 && 
           !this.isLoading;
  }

  createPost() {
    if (!this.canPost()) return;

    this.isLoading = true;

    if (this.selectedFile) {
      // Create post with image upload
      const formData = new FormData();
      formData.append('content', this.postContent.trim());
      formData.append('image', this.selectedFile);

      this.http.post<Post>('http://localhost:8081/api/posts/with-image', formData).subscribe({
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
    } else {
      // Create text-only post
      const request: CreatePostRequest = {
        content: this.postContent.trim()
      };

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
  }

  private resetForm() {
    this.postContent = '';
    this.showImageUpload = false;
    this.removeImage();
  }

  getCurrentUserInitial(): string {
    const user = this.auth.currentUser;
    if (user && user.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
