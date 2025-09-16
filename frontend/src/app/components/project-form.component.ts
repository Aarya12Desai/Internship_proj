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
        <label for="description">Project Description *</label>
        <textarea id="description" name="description" [(ngModel)]="project.description" rows="6" placeholder="Describe your project in detail - include the problem it solves, technologies used, target audience, and what makes it unique. This will be used to find matching projects." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="!projectForm.valid">Find AI Matches</button>
      </div>
    </form>
  `
})
export class ProjectFormComponent {
  @Output() formSubmit = new EventEmitter<any>();
  project: any = {
    description: ''
  };

  onSubmit() {
    this.formSubmit.emit(this.project);
  }
}
