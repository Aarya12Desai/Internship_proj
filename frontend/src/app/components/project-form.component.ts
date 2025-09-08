import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #projectForm="ngForm">
      <div class="form-group">
        <label for="name">Project Name *</label>
        <input type="text" id="name" name="name" [(ngModel)]="project.name" placeholder="Enter your project name" required />
      </div>
      <div class="form-group">
        <label for="description">Description *</label>
        <textarea id="description" name="description" [(ngModel)]="project.description" rows="4" placeholder="Describe your project, goals, and what you're looking for in collaborators" required></textarea>
      </div>
      <div class="form-group">
        <label for="image">Project Image</label>
        <input type="file" id="image" name="image" (change)="onImageSelected($event)" accept="image/*" />
        <div *ngIf="imagePreview" class="image-preview">
          <img [src]="imagePreview" alt="Project Image Preview" style="max-width: 200px; max-height: 200px; margin-top: 10px;" />
          <button type="button" (click)="removeImage()">Remove Image</button>
        </div>
      </div>
      <div class="form-group">
        <label for="technologiesUsed">Technologies Used *</label>
        <input type="text" id="technologiesUsed" name="technologiesUsed" [(ngModel)]="project.technologiesUsed" placeholder="e.g. Angular, Spring Boot, MySQL" required />
      </div>
      <div class="form-group">
        <label for="domain">Domain *</label>
        <input type="text" id="domain" name="domain" [(ngModel)]="project.domain" placeholder="e.g. FinTech, HealthTech, EdTech" required />
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="!projectForm.valid">Submit</button>
      </div>
    </form>
  `
})
export class ProjectFormComponent {
  @Output() formSubmit = new EventEmitter<any>();
  project: any = {
    name: '',
    description: '',
    technologiesUsed: '',
    domain: '',
    image: null
  };
  imagePreview: string | null = null;

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.project.image = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.project.image = null;
    this.imagePreview = null;
  }

  onSubmit() {
    this.formSubmit.emit(this.project);
  }
}
