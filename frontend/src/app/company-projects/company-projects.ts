import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-management">
      <div class="page-header">
        <h1>Project Management</h1>
        <button class="create-btn" (click)="navigateToCreateProject()">
          <i class="fas fa-plus"></i>
          Post New Project
        </button>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label for="statusFilter">Filter by Status:</label>
          <select id="statusFilter" [(ngModel)]="selectedStatus" (change)="filterProjects()">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        
        <div class="search-group">
          <label for="searchTerm">Search Projects:</label>
          <input 
            type="text" 
            id="searchTerm" 
            [(ngModel)]="searchTerm" 
            (input)="filterProjects()" 
            placeholder="Search by title or description..."
          >
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading projects...
      </div>

      <div *ngIf="!isLoading && filteredProjects.length === 0" class="empty-state">
        <i class="fas fa-project-diagram"></i>
        <h3>No projects found</h3>
        <p *ngIf="!searchTerm && !selectedStatus">You haven't posted any projects yet.</p>
        <p *ngIf="searchTerm || selectedStatus">No projects match your current filters.</p>
        <button *ngIf="!searchTerm && !selectedStatus" class="create-project-btn" (click)="navigateToCreateProject()">
          Create Your First Project
        </button>
      </div>

      <div *ngIf="!isLoading && filteredProjects.length > 0" class="projects-list">
        <div *ngFor="let project of filteredProjects" class="project-item">
          <div class="project-header">
            <div class="project-title-section">
              <h3>{{project.title}}</h3>
              <span class="project-status" [ngClass]="project.status?.toLowerCase()">
                {{project.status}}
              </span>
            </div>
            <div class="project-actions">
              <button class="action-btn edit" (click)="editProject(project.id)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="action-btn view" (click)="viewProject(project.id)">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="action-btn delete" (click)="deleteProject(project.id)">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
          
          <div class="project-details">
            <div class="project-meta">
              <span class="project-type">{{project.projectType}}</span>
              <span class="project-location">{{project.location}}</span>
              <span *ngIf="project.remoteAllowed" class="remote-tag">Remote Allowed</span>
              <span *ngIf="project.durationMonths" class="duration-tag">{{project.durationMonths}} months</span>
            </div>
            
            <p class="project-description">
              {{project.description | slice:0:150}}{{project.description?.length > 150 ? '...' : ''}}
            </p>
            
            <div class="project-info">
              <div class="info-item" *ngIf="project.requiredSkills">
                <strong>Required Skills:</strong> {{project.requiredSkills}}
              </div>
              <div class="info-item" *ngIf="project.budgetRange">
                <strong>Budget:</strong> {{project.budgetRange}}
              </div>
              <div class="info-item" *ngIf="project.maxTeamSize">
                <strong>Team Size:</strong> Up to {{project.maxTeamSize}} members
              </div>
              <div class="info-item" *ngIf="project.applicationDeadline">
                <strong>Deadline:</strong> {{formatDate(project.applicationDeadline)}}
              </div>
            </div>
            
            <div class="project-footer">
              <span class="created-date">
                Created: {{formatDate(project.createdAt)}}
              </span>
              <span *ngIf="project.updatedAt" class="updated-date">
                Updated: {{formatDate(project.updatedAt)}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./company-projects.css']
})
export class CompanyProjectsComponent implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);

  projects: any[] = [];
  filteredProjects: any[] = [];
  isLoading = true;
  selectedStatus = '';
  searchTerm = '';

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    const token = this.authService.token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8081/api/company-projects/my-projects', { headers })
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.filteredProjects = projects;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.isLoading = false;
        }
      });
  }

  filterProjects() {
    this.filteredProjects = this.projects.filter(project => {
      const matchesStatus = !this.selectedStatus || project.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        project.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  navigateToCreateProject() {
    this.router.navigate(['/company/create-project']);
  }

  editProject(projectId: number) {
    this.router.navigate(['/company/edit-project', projectId]);
  }

  viewProject(projectId: number) {
    this.router.navigate(['/company/project', projectId]);
  }

  deleteProject(projectId: number) {
    if (confirm('Are you sure you want to delete this project posting?')) {
      const token = this.authService.token;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:8081/api/company-projects/${projectId}`, { headers })
        .subscribe({
          next: () => {
            this.projects = this.projects.filter(project => project.id !== projectId);
            this.filterProjects();
          },
          error: (error) => {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. Please try again.');
          }
        });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
