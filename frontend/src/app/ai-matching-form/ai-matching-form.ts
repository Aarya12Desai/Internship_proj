import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-ai-matching-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-matching-form-container">
      <div class="ai-matching-form-card">
        <div class="header">
          <h2>AI Project Matching</h2>
          <p>Find similar projects using AI-powered matching based on description similarity</p>
        </div>
        <form (ngSubmit)="submitForm()" #aiForm="ngForm">
          <div class="form-group">
            <label for="description">Project Description *</label>
            <textarea id="description" name="description" [(ngModel)]="form.description" rows="6" placeholder="Describe your project in detail - include the problem it solves, technologies used, target audience, and what makes it unique. This will be used to find matching projects." required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="!aiForm.valid || loading()">
              {{ loading() ? 'Matching...' : 'Find Matches' }}
            </button>
          </div>
        </form>
        <div *ngIf="error()" class="error-message">{{ error() }}</div>
        <div *ngIf="matches && matches.length > 0" class="matches-list">
          <h3>Matched Projects ({{ matches.length }} found)</h3>
          <ul>
            <li *ngFor="let match of matches">
              <div class="match-header">
                <strong>{{ match.title }}</strong>
                <span class="match-score">{{ match.matchScore }}% match</span>
              </div>
              <div class="match-details">
                <p><strong>Creator:</strong> {{ match.creator || 'Unknown' }}</p>
                <p><strong>Domain:</strong> {{ match.domain }}</p>
                <p><strong>Technologies:</strong> {{ match.technologies }}</p>
                <p><strong>Description:</strong> {{ match.description }}</p>
              </div>
            </li>
          </ul>
        </div>
        <div *ngIf="matches && matches.length === 0 && !loading()" class="no-matches">
          <h4>No matching projects found</h4>
          <p>No projects in the database match your description with sufficient similarity (≥50%). Try using different keywords or describing your project in more detail.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-matching-form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
      min-height: 100vh;
    }
    .ai-matching-form-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-primary {
      background: #185a9d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }
    .btn-primary:disabled {
      background: #b0b0b0;
      cursor: not-allowed;
    }
    .error-message {
      color: #d32f2f;
      margin-top: 10px;
      text-align: center;
    }
    .matches-list {
      margin-top: 30px;
    }
    .matches-list ul {
      list-style: none;
      padding: 0;
    }
    .matches-list li {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 15px;
      border-left: 4px solid #185a9d;
    }
    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .match-header strong {
      font-size: 1.1rem;
      color: #333;
    }
    .match-score {
      background: #4caf50;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: bold;
    }
    .match-details p {
      margin: 5px 0;
      color: #555;
      font-size: 0.95rem;
    }
    .match-details strong {
      color: #333;
    }
    .no-matches {
      margin-top: 30px;
      text-align: center;
      color: #888;
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px dashed #ddd;
    }
    .no-matches h4 {
      color: #666;
      margin-bottom: 10px;
    }
    .no-matches p {
      margin: 5px 0;
      font-size: 0.95rem;
    }
  `]
})
export class AiMatchingFormComponent {
  form = {
    description: ''
  };
  matches: any[] = [];
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient, private auth: Auth) {}

  submitForm() {
    if (this.loading()) return;
    const token = this.auth.token;
    if (!token) {
      this.error.set('Please log in to use AI matching');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.matches = [];
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const payload = {
      description: this.form.description.trim()
    };
    this.http.post<any[]>('http://localhost:8081/api/ai-matching', payload, { headers })
      .subscribe({
        next: (response) => {
          this.matches = response || [];
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to find matches. Please try again.');
          this.loading.set(false);
        }
      });
  }
}
