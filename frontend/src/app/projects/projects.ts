import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../services/auth';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    const token = this.auth.token;
    if (!token) {
      this.error.set('Please log in to view your projects');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Project[]>('http://localhost:8081/api/projects/my-projects', { headers })
      .subscribe({
        next: (projects) => {
          this.projects.set(projects);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load projects');
          this.loading.set(false);
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'paused': return 'status-paused';
      default: return 'status-draft';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  deleteProject(projectId: number) {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    const token = this.auth.token;
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8081/api/projects/${projectId}`, { headers })
      .subscribe({
        next: () => {
          this.projects.update(projects => 
            projects.filter(p => p.id !== projectId)
          );
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to delete project');
        }
      });
  }
}
