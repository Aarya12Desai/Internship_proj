import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '../services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-company-create-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-project-container">
      <div class="form-header">
        <h1>{{isEditMode ? 'Edit Project' : 'Post a New Project'}}</h1>
        <p>{{isEditMode ? 'Update your project details' : 'Attract skilled collaborators to your company project'}}</p>
      </div>

      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
        <div class="form-row">
          <div class="form-group">
            <label for="title">Project Title *</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title"
              placeholder="Enter project title"
              [class.error]="projectForm.get('title')?.invalid && projectForm.get('title')?.touched"
            >
            <div *ngIf="projectForm.get('title')?.invalid && projectForm.get('title')?.touched" class="error-message">
              Project title is required
            </div>
          </div>

          <div class="form-group">
            <label for="projectType">Project Type *</label>
            <select 
              id="projectType" 
              formControlName="projectType"
              [class.error]="projectForm.get('projectType')?.invalid && projectForm.get('projectType')?.touched"
            >
              <option value="">Select project type</option>
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
            <div *ngIf="projectForm.get('projectType')?.invalid && projectForm.get('projectType')?.touched" class="error-message">
              Project type is required
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Project Description *</label>
          <textarea 
            id="description" 
            formControlName="description"
            rows="5"
            placeholder="Describe your project, its goals, and what you're looking for in collaborators..."
            [class.error]="projectForm.get('description')?.invalid && projectForm.get('description')?.touched"
          ></textarea>
          <div *ngIf="projectForm.get('description')?.invalid && projectForm.get('description')?.touched" class="error-message">
            Project description is required
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="requiredSkills">Required Skills *</label>
            <input 
              type="text" 
              id="requiredSkills" 
              formControlName="requiredSkills"
              placeholder="e.g., React, Node.js, Python, UI/UX"
              [class.error]="projectForm.get('requiredSkills')?.invalid && projectForm.get('requiredSkills')?.touched"
            >
            <div *ngIf="projectForm.get('requiredSkills')?.invalid && projectForm.get('requiredSkills')?.touched" class="error-message">
              Required skills are necessary
            </div>
          </div>

          <div class="form-group">
            <label for="budgetRange">Budget Range</label>
            <select id="budgetRange" formControlName="budgetRange">
              <option value="">Select budget range</option>
              <option value="Under $1,000">Under $1,000</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000 - $50,000">$25,000 - $50,000</option>
              <option value="$50,000+">$50,000+</option>
              <option value="Equity/Revenue Share">Equity/Revenue Share</option>
              <option value="Unpaid/Volunteer">Unpaid/Volunteer</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="location">Location *</label>
            <input 
              type="text" 
              id="location" 
              formControlName="location"
              placeholder="e.g., New York, NY or Remote"
              [class.error]="projectForm.get('location')?.invalid && projectForm.get('location')?.touched"
            >
            <div *ngIf="projectForm.get('location')?.invalid && projectForm.get('location')?.touched" class="error-message">
              Location is required
            </div>
          </div>

          <div class="form-group">
            <label for="durationMonths">Duration (Months)</label>
            <input 
              type="number" 
              id="durationMonths" 
              formControlName="durationMonths"
              placeholder="e.g., 6"
              min="1"
              max="60"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="maxTeamSize">Maximum Team Size</label>
            <input 
              type="number" 
              id="maxTeamSize" 
              formControlName="maxTeamSize"
              placeholder="e.g., 5"
              min="1"
              max="50"
            >
          </div>

          <div class="form-group">
            <label for="applicationDeadline">Application Deadline</label>
            <input 
              type="date" 
              id="applicationDeadline" 
              formControlName="applicationDeadline"
              [min]="tomorrow"
            >
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              formControlName="remoteAllowed"
            >
            <span class="checkmark"></span>
            Remote work allowed
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="projectForm.invalid || isSubmitting"
          >
            <span *ngIf="isSubmitting">
              <i class="fas fa-spinner fa-spin"></i>
              {{isEditMode ? 'Updating...' : 'Posting...'}}
            </span>
            <span *ngIf="!isSubmitting">
              <i class="fas fa-rocket"></i>
              {{isEditMode ? 'Update Project' : 'Post Project'}}
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./company-create-project.css']
})
export class CompanyCreateProjectComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  isSubmitting = false;
  isEditMode = false;
  projectId: number | null = null;
  tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  projectForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    projectType: ['', Validators.required],
    requiredSkills: ['', Validators.required],
    budgetRange: [''],
    location: ['', Validators.required],
    remoteAllowed: [false],
    durationMonths: [''],
    maxTeamSize: [''],
    applicationDeadline: ['']
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.projectId = +params['id'];
        this.loadProject();
      }
    });
  }

  loadProject() {
    if (!this.projectId) return;

    const token = this.authService.token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://localhost:8081/api/company-projects/${this.projectId}`, { headers })
      .subscribe({
        next: (project: any) => {
          // Format the date for the input field
          let formattedDate = '';
          if (project.applicationDeadline) {
            const date = new Date(project.applicationDeadline);
            formattedDate = date.toISOString().split('T')[0];
          }

          this.projectForm.patchValue({
            title: project.title,
            description: project.description,
            projectType: project.projectType,
            requiredSkills: project.requiredSkills,
            budgetRange: project.budgetRange,
            location: project.location,
            remoteAllowed: project.remoteAllowed,
            durationMonths: project.durationMonths,
            maxTeamSize: project.maxTeamSize,
            applicationDeadline: formattedDate
          });
        },
        error: (error) => {
          console.error('Error loading project:', error);
          alert('Failed to load project details.');
          this.router.navigate(['/company/projects']);
        }
      });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.isSubmitting = true;
      
      const projectData = {
        ...this.projectForm.value,
        durationMonths: this.projectForm.value.durationMonths || null,
        maxTeamSize: this.projectForm.value.maxTeamSize || null,
        applicationDeadline: this.projectForm.value.applicationDeadline || null
      };

      const token = this.authService.token;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      if (this.isEditMode && this.projectId) {
        // Update existing project
        this.http.put(`http://localhost:8081/api/company-projects/${this.projectId}`, projectData, { headers })
          .subscribe({
            next: (response) => {
              console.log('Project updated successfully:', response);
              this.router.navigate(['/company/projects']);
            },
            error: (error) => {
              console.error('Error updating project:', error);
              alert('Failed to update project. Please try again.');
              this.isSubmitting = false;
            }
          });
      } else {
        // Create new project
        this.http.post('http://localhost:8081/api/company-projects', projectData, { headers })
          .subscribe({
            next: (response) => {
              console.log('Project created successfully:', response);
              this.router.navigate(['/company/projects']);
            },
            error: (error) => {
              console.error('Error creating project:', error);
              alert('Failed to create project. Please try again.');
              this.isSubmitting = false;
            }
          });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack() {
    this.router.navigate(['/company/projects']);
  }
}
