import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-user-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-project-container">
      <div class="create-project-card">
        <div class="header">
          <h2>Create New Project</h2>
          <p>Share your project idea and find collaborators</p>
        </div>

        <form (ngSubmit)="createProject()" #projectForm="ngForm">
          <div class="form-group">
            <label for="name">Project Name *</label>
            <input 
              type="text" 
              id="name"
              name="name"
              [(ngModel)]="project.name" 
              placeholder="Enter your project name"
              required
              #nameInput="ngModel"
            />
            <div *ngIf="nameInput.invalid && nameInput.touched" class="error-text">
              Project name is required
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea 
              id="description"
              name="description"
              [(ngModel)]="project.description" 
              rows="4" 
              placeholder="Describe your project, goals, and what you're looking for in collaborators"
              required
              #descInput="ngModel"
            ></textarea>
            <div *ngIf="descInput.invalid && descInput.touched" class="error-text">
              Project description is required
            </div>
          </div>

          <div class="form-group">
            <label for="country">Country</label>
            <input 
              type="text" 
              id="country"
              name="country"
              [(ngModel)]="project.country" 
              placeholder="Your country"
            />
          </div>

          <div class="form-group">
            <label for="language">Primary Language</label>
            <input 
              type="text" 
              id="language"
              name="language"
              [(ngModel)]="project.language" 
              placeholder="Primary language for communication"
            />
          </div>

          <div *ngIf="error()" class="error-message">
            {{ error() }}
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              class="btn-secondary" 
              (click)="goBack()"
              [disabled]="loading()"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn-primary" 
              [disabled]="!projectForm.valid || loading()"
            >
              {{ loading() ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-project-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .create-project-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h2 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .header p {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    input, textarea, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .help-text {
      color: #666;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }

    .error-text {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .error-message {
      background-color: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      border: 1px solid #fcc;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e9ecef;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .create-project-container {
        padding: 10px;
      }

      .create-project-card {
        padding: 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class UserCreateProjectComponent {
  project = {
    name: '',
    description: '',
    country: '',
    language: ''
  };

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {}

  createProject() {
    if (this.loading()) return;

    const token = this.auth.token;
    if (!token) {
      this.error.set('Please log in to create a project');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Prepare the payload to match backend ProjectRequest DTO
    const payload = {
      name: this.project.name.trim(),
      description: this.project.description.trim(),
      country: this.project.country.trim() || null,
      language: this.project.language.trim() || null
    };

    this.http.post<any>('http://localhost:8081/api/projects', payload, { headers })
      .subscribe({
        next: (response) => {
          console.log('Project created successfully:', response);
          this.loading.set(false);
          // Navigate back to projects page
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          console.error('Error creating project:', err);
          this.error.set(err.error?.message || 'Failed to create project. Please try again.');
          this.loading.set(false);
        }
      });
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}
