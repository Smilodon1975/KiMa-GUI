// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models/project.model';
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

  create(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  update(id: number, project: Partial<Project>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
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