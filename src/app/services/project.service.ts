// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Project, ProjectStatus } from '../models/project.model';
import { ProjectResponse } from '../models/project-response.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private readonly apiUrlResponses = `${environment.apiUrl}/ProjectResponses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(data: Partial<Project>): Observable<Project> {
    const payload = { ...data, status: 'draft' as Project['status'] };
    return this.http.post<Project>(this.apiUrl, payload);
  }

  updateProject(id: number, data: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data);
  }

  patchProject(id: number, patch: any[]): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json-patch+json' });
    return this.http.patch<void>(url, patch, { headers });
  }

  updateStatus(id: number, status: ProjectStatus): Observable<void> {
  return this.http.patch<void>(
    `${this.apiUrl}/${id}/status`,
    { status }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitResponse(resp: ProjectResponse): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(
      `${this.apiUrlResponses}/${resp.projectId}/responses`,
      resp
    );
  }

  getResponses(projectId: number): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.apiUrlResponses}/${projectId}/responses`);
  }

  

}