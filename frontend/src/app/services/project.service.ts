import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:8081/api/projects';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  createProject(payload: any): Observable<any> {
    const token = this.auth.token;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    return this.http.post<any>(this.apiUrl, payload, { headers });
  }
}
