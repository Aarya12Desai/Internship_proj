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
            <i class="fas fa-briefcase"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalJobs || 0}}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="fas fa-play-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.activeJobs || 0}}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        
        <div class="stat-card closed">
          <div class="stat-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{stats.closedJobs || 0}}</h3>
            <p>Closed Jobs</p>
          </div>
        </div>
        
        <div class="stat-card applications">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>0</h3>
            <p>Applications</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-btn primary" (click)="navigateToCreateJob()">
            <i class="fas fa-plus"></i>
            Post New Job
          </button>
          <button class="action-btn secondary" (click)="navigateToJobs()">
            <i class="fas fa-list"></i>
            Manage Jobs
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

      <!-- Recent Jobs -->
      <div class="recent-jobs-section">
        <div class="section-header">
          <h2>Recent Job Postings</h2>
          <button class="view-all-btn" (click)="navigateToJobs()">View All</button>
        </div>
        
        <div *ngIf="recentJobs.length === 0" class="empty-state">
          <i class="fas fa-briefcase"></i>
          <h3>No job postings yet</h3>
          <p>Create your first job posting to start attracting candidates</p>
          <button class="create-job-btn" (click)="navigateToCreateJob()">
            Create Job Posting
          </button>
        </div>
        
        <div *ngIf="recentJobs.length > 0" class="jobs-grid">
          <div *ngFor="let job of recentJobs" class="job-card">
            <div class="job-header">
              <h3>{{job.title}}</h3>
              <span class="job-status" [ngClass]="job.status?.toLowerCase()">
                {{job.status}}
              </span>
            </div>
            <p class="job-description">{{job.description | slice:0:100}}{{job.description?.length > 100 ? '...' : ''}}</p>
            <div class="job-details">
              <span class="job-type">{{job.jobType}}</span>
              <span class="job-location">{{job.location}}</span>
            </div>
            <div class="job-actions">
              <button class="edit-btn" (click)="editJob(job.id)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="view-btn" (click)="viewJob(job.id)">
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
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    applications: 0
  };
  recentJobs: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadCompanyData();
    this.loadDashboardStats();
    this.loadRecentJobs();
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

    this.http.get<any>('http://localhost:8081/api/company-jobs/dashboard-stats', { headers })
      .subscribe({
        next: (response) => {
          this.stats = response;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
        }
      });
  }

  loadRecentJobs() {
    const token = this.authService.token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8081/api/company-jobs/my-jobs', { headers })
      .subscribe({
        next: (jobs) => {
          this.recentJobs = jobs.slice(0, 3); // Show only first 3 recent jobs
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading recent jobs:', error);
          this.isLoading = false;
        }
      });
  }

  navigateToCreateJob() {
    this.router.navigate(['/company/create-job']);
  }

  navigateToJobs() {
    this.router.navigate(['/company/jobs']);
  }

  navigateToProfile() {
    this.router.navigate(['/company/profile']);
  }

  navigateToApplications() {
    this.router.navigate(['/company/applications']);
  }

  editJob(jobId: number) {
    this.router.navigate(['/company/edit-job', jobId]);
  }

  viewJob(jobId: number) {
    this.router.navigate(['/company/job', jobId]);
  }
}
