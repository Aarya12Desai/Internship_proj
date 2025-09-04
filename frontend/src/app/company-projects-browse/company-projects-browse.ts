import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-company-projects-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="browse-projects-container">
      <div class="page-header">
        <h1>Browse Company Projects</h1>
        <p>Discover exciting projects from companies looking for talented collaborators</p>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label for="searchTerm">Search Projects:</label>
          <input 
            type="text" 
            id="searchTerm" 
            [(ngModel)]="searchTerm" 
            (input)="filterProjects()" 
            placeholder="Search by title, skills, or description..."
          >
        </div>
        
        <div class="filter-group">
          <label for="projectTypeFilter">Project Type:</label>
          <select id="projectTypeFilter" [(ngModel)]="selectedProjectType" (change)="filterProjects()">
            <option value="">All Types</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile App">Mobile App Development</option>
            <option value="Data Science">Data Science</option>
            <option value="AI/ML">AI/Machine Learning</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Frontend Development">Frontend Development</option>
            <option value="Full Stack">Full Stack Development</option>
            <option value="DevOps">DevOps</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Research">Research</option>
            <option value="Consulting">Consulting</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="locationFilter">Location:</label>
          <input 
            type="text" 
            id="locationFilter" 
            [(ngModel)]="selectedLocation" 
            (input)="filterProjects()" 
            placeholder="e.g., Remote, New York..."
          >
        </div>

        <div class="filter-group">
          <label for="remoteFilter">Remote Work:</label>
          <select id="remoteFilter" [(ngModel)]="remoteFilter" (change)="filterProjects()">
            <option value="">All Projects</option>
            <option value="remote">Remote Allowed</option>
            <option value="onsite">On-site Only</option>
          </select>
        </div>
      </div>

      <div class="results-info" *ngIf="!isLoading">
        <p>{{filteredProjects.length}} project(s) found</p>
        <button class="refresh-btn" (click)="loadProjects()">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      <div *ngIf="isLoading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading projects...
      </div>

      <div *ngIf="!isLoading && filteredProjects.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No projects found</h3>
        <p *ngIf="searchTerm || selectedProjectType || selectedLocation || remoteFilter">
          Try adjusting your search filters to find more projects.
        </p>
        <p *ngIf="!searchTerm && !selectedProjectType && !selectedLocation && !remoteFilter">
          No companies have posted projects yet. Check back later!
        </p>
      </div>

      <div *ngIf="!isLoading && filteredProjects.length > 0" class="projects-grid">
        <div *ngFor="let project of filteredProjects" class="project-card">
          <div class="project-header">
            <div class="company-info">
              <h3>{{project.title}}</h3>
              <p class="company-name">
                <i class="fas fa-building"></i>
                {{project.company?.companyName || project.company?.username || 'Company'}}
              </p>
            </div>
            <div class="project-meta">
              <span class="project-type">{{project.projectType}}</span>
              <span class="project-status" [ngClass]="project.status?.toLowerCase()">
                {{project.status}}
              </span>
            </div>
          </div>
          
          <div class="project-content">
            <p class="project-description">
              {{project.description | slice:0:200}}{{project.description?.length > 200 ? '...' : ''}}
            </p>
            
            <div class="project-details">
              <div class="detail-item" *ngIf="project.requiredSkills">
                <strong>Required Skills:</strong>
                <span class="skills-list">{{project.requiredSkills}}</span>
              </div>
              
              <div class="detail-row">
                <div class="detail-item" *ngIf="project.location">
                  <strong>Location:</strong> {{project.location}}
                </div>
                <div class="detail-item" *ngIf="project.budgetRange">
                  <strong>Budget:</strong> {{project.budgetRange}}
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-item" *ngIf="project.durationMonths">
                  <strong>Duration:</strong> {{project.durationMonths}} months
                </div>
                <div class="detail-item" *ngIf="project.maxTeamSize">
                  <strong>Team Size:</strong> Up to {{project.maxTeamSize}} members
                </div>
              </div>
              
              <div class="project-tags">
                <span *ngIf="project.remoteAllowed" class="tag remote">Remote Allowed</span>
                <span *ngIf="project.applicationDeadline" class="tag deadline">
                  Deadline: {{formatDate(project.applicationDeadline)}}
                </span>
              </div>
            </div>
          </div>
          
          <div class="project-footer">
            <div class="project-date">
              Posted: {{formatDate(project.createdAt)}}
            </div>
            <div class="project-actions">
              <button class="btn-view" (click)="viewProject(project)">
                <i class="fas fa-eye"></i>
                View Details
              </button>
              <button class="btn-apply" (click)="applyToProject(project)" [disabled]="project.status !== 'OPEN'">
                <i class="fas fa-paper-plane"></i>
                {{project.status === 'OPEN' ? 'Apply Now' : 'Not Available'}}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Details Modal -->
    <div *ngIf="selectedProject" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{selectedProject.title}}</h2>
          <button class="close-btn" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="company-info-detailed">
            <h4>{{selectedProject.company?.companyName || selectedProject.company?.username || 'Company'}}</h4>
            <p *ngIf="selectedProject.company?.email">{{selectedProject.company.email}}</p>
          </div>
          
          <div class="project-full-description">
            <h4>Project Description</h4>
            <p>{{selectedProject.description}}</p>
          </div>
          
          <div class="project-requirements">
            <h4>Requirements</h4>
            <p><strong>Required Skills:</strong> {{selectedProject.requiredSkills}}</p>
            <p><strong>Project Type:</strong> {{selectedProject.projectType}}</p>
            <p><strong>Location:</strong> {{selectedProject.location}}</p>
            <p *ngIf="selectedProject.budgetRange"><strong>Budget Range:</strong> {{selectedProject.budgetRange}}</p>
            <p *ngIf="selectedProject.durationMonths"><strong>Duration:</strong> {{selectedProject.durationMonths}} months</p>
            <p *ngIf="selectedProject.maxTeamSize"><strong>Maximum Team Size:</strong> {{selectedProject.maxTeamSize}} members</p>
            <p *ngIf="selectedProject.applicationDeadline"><strong>Application Deadline:</strong> {{formatDate(selectedProject.applicationDeadline)}}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">Close</button>
          <button class="btn-primary" (click)="applyToProject(selectedProject)" [disabled]="selectedProject.status !== 'OPEN'">
            <i class="fas fa-paper-plane"></i>
            {{selectedProject.status === 'OPEN' ? 'Apply Now' : 'Not Available'}}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./company-projects-browse.css']
})
export class CompanyProjectsBrowseComponent implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);

  projects: any[] = [];
  filteredProjects: any[] = [];
  isLoading = true;
  
  // Filters
  searchTerm = '';
  selectedProjectType = '';
  selectedLocation = '';
  remoteFilter = '';
  
  // Modal
  selectedProject: any = null;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    
    this.http.get<any[]>('http://localhost:8081/api/company-projects/public')
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
      const matchesSearch = !this.searchTerm || 
        project.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.requiredSkills.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedProjectType || 
        project.projectType === this.selectedProjectType;
      
      const matchesLocation = !this.selectedLocation || 
        project.location.toLowerCase().includes(this.selectedLocation.toLowerCase());
      
      let matchesRemote = true;
      if (this.remoteFilter === 'remote') {
        matchesRemote = project.remoteAllowed;
      } else if (this.remoteFilter === 'onsite') {
        matchesRemote = !project.remoteAllowed;
      }
      
      return matchesSearch && matchesType && matchesLocation && matchesRemote;
    });
  }

  viewProject(project: any) {
    this.selectedProject = project;
  }

  closeModal() {
    this.selectedProject = null;
  }

  applyToProject(project: any) {
    if (project.status !== 'OPEN') {
      alert('This project is no longer accepting applications.');
      return;
    }

    // Simple application - in a real app, this would open a detailed form
    const coverLetter = prompt(`Please write a brief cover letter for "${project.title}":`);
    
    if (coverLetter !== null && coverLetter.trim()) {
      const token = this.authService.token;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const applicationData = {
        projectId: project.id,
        coverLetter: coverLetter.trim()
      };
      
      this.http.post('http://localhost:8081/api/project-applications', applicationData, { headers })
        .subscribe({
          next: (response) => {
            alert('Application submitted successfully! The company will be notified of your interest.');
            this.closeModal();
          },
          error: (error) => {
            console.error('Error submitting application:', error);
            if (error.status === 409) {
              alert('You have already applied to this project.');
            } else {
              alert('Failed to submit application. Please try again.');
            }
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
