
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectResponse } from '../../models/project-response.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-view',
  imports: [CommonModule],
  standalone: true,
  providers: [ProjectService],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css'
})
export class ProjectViewComponent implements OnInit{
projects: Project[] = [];
  loading = true;
  errorMsg = '';

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Projekte:', err);
        this.errorMsg = 'Die Projekte konnten nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  openProject(project: Project): void {
    // Navigiert zu /projects/:id
    this.router.navigate(['/projects', project.id]);
  }
}

