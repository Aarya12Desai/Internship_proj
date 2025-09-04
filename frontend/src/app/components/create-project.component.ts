import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { ProjectNotificationService } from '../services/project-notification.service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-project-card">
      <h3>Create Project</h3>
      <div>
        <label>Project Name</label>
        <input [(ngModel)]="name" placeholder="Name of project" />
      </div>

      <div>
        <label>Country</label>
        <input [(ngModel)]="country" placeholder="Country" />
      </div>

      <div>
        <label>Spoken Language</label>
        <input [(ngModel)]="language" placeholder="Spoken language" />
      </div>

      <div>
        <label>Description</label>
        <textarea [(ngModel)]="description" rows="4" placeholder="Description of project"></textarea>
      </div>

      <div style="margin-top:10px;">
        <button (click)="createProject()" [disabled]="isLoading || !canCreate()">{{ isLoading ? 'Creating...' : 'Create' }}</button>
      </div>
    </div>
  `
})
export class CreateProjectComponent {
  @Output() projectCreated = new EventEmitter<any>();

  name = '';
  country = '';
  description = '';
  language = '';
  isLoading = false;

  constructor(
    private projectService: ProjectService,
    private projectNotificationService: ProjectNotificationService
  ) {}

  canCreate() {
    return this.name.trim().length > 0 && this.country.trim().length > 0;
  }

  createProject() {
    if (!this.canCreate()) return;
    this.isLoading = true;
    const payload = {
      name: this.name.trim(),
      country: this.country.trim(),
      description: this.description.trim() || undefined,
      language: this.language.trim() || undefined
    };
    this.projectService.createProject(payload).subscribe({
      next: (res: any) => {
        this.projectCreated.emit(res);
        
  // After creating a project, refresh notifications from backend
  this.projectNotificationService.refreshUserNotifications();
        
        this.reset();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Create project error', err);
        alert('Error creating project');
        this.isLoading = false;
      }
    });
  }

  private reset() {
    this.name = '';
    this.country = '';
    this.description = '';
    this.language = '';
  }
}
