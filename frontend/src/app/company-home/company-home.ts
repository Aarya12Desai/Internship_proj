import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-company-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="company-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Welcome back, {{companyName}}</h1>
        <p class="text-muted">Manage your job postings and company profile</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalProjects || 0}}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="fas fa-folder-open"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.openProjects || 0}}</h3>
            <p>Open Projects</p>
          </div>
        </div>
        
        <div class="stat-card progress">
          <div class="stat-icon">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.inProgressProjects || 0}}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div class="stat-card completed">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.completedProjects || 0}}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-btn primary" (click)="navigateToCreateProject()">
            <i class="fas fa-plus"></i>
            Post New Project
          </button>
          <button class="action-btn secondary" (click)="navigateToProjects()">
            <i class="fas fa-list"></i>
            Manage Projects
          </button>
          <button class="action-btn tertiary" (click)="navigateToProfile()">
            <i class="fas fa-building"></i>
            Company Profile
          </button>
          <button class="action-btn quaternary" (click)="navigateToApplications()">
            <i class="fas fa-inbox"></i>
            View Applications
          </button>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="recent-projects-section">
        <div class="section-header">
          <h2>Recent Project Postings</h2>
          <button class="view-all-btn" (click)="navigateToProjects()">View All</button>
        </div>
        
        <div *ngIf="recentProjects.length === 0" class="empty-state">
          <i class="fas fa-project-diagram"></i>
          <h3>No project postings yet</h3>
          <p>Create your first project posting to start attracting collaborators</p>
          <button class="create-project-btn" (click)="navigateToCreateProject()">
            Create Project Posting
          </button>
        </div>
        
        <div *ngIf="recentProjects.length > 0" class="projects-grid">
          <div *ngFor="let project of recentProjects" class="project-card">
            <div class="project-header">
              <h3>{{project.title}}</h3>
              <span class="project-status" [ngClass]="project.status?.toLowerCase()">
                {{project.status}}
              </span>
            </div>
            <p class="project-description">{{project.description | slice:0:100}}{{project.description?.length > 100 ? '...' : ''}}</p>
            <div class="project-details">
              <span class="project-type">{{project.projectType}}</span>
              <span class="project-location">{{project.location}}</span>
              <span *ngIf="project.durationMonths" class="project-duration">{{project.durationMonths}} months</span>
            </div>
            <div class="project-actions">
              <button class="edit-btn" (click)="editProject(project.id)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="view-btn" (click)="viewProject(project.id)">
                <i class="fas fa-eye"></i> View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./company-home.css']
})
export class CompanyHomeComponent implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);

  companyName = '';
  stats = {
    totalProjects: 0,
    openProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0
  };
  recentProjects: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadCompanyData();
    this.loadDashboardStats();
    this.loadRecentProjects();
  }

  loadCompanyData() {
    const user = this.authService.currentUser;
    if (user) {
      this.companyName = user.companyName || user.username || 'Company';
    }
  }

  loadDashboardStats() {
    const token = this.authService.token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:8081/api/company-projects/dashboard-stats', { headers })
      .subscribe({
        next: (response) => {
          this.stats = response;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
        }
      });
  }

  loadRecentProjects() {
    const token = this.authService.token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8081/api/company-projects/my-projects', { headers })
      .subscribe({
        next: (projects) => {
          this.recentProjects = projects.slice(0, 3); // Show only first 3 recent projects
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading recent projects:', error);
          this.isLoading = false;
        }
      });
  }

  navigateToCreateProject() {
    this.router.navigate(['/company/create-project']);
  }

  navigateToProjects() {
    this.router.navigate(['/company/projects']);
  }

  navigateToProfile() {
    this.router.navigate(['/company/profile']);
  }

  navigateToApplications() {
    this.router.navigate(['/company/applications']);
  }

  editProject(projectId: number) {
    this.router.navigate(['/company/edit-project', projectId]);
  }

  viewProject(projectId: number) {
    this.router.navigate(['/company/project', projectId]);
  }
}
