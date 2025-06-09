
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, Navigation } from '@angular/router';
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
  responseSuccessMsg: string | null = null;
  hideAlert = false;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const nav: Navigation | null = this.router.getCurrentNavigation();
    let state = nav?.extras?.state as { responseSuccess?: boolean } | undefined;
    if (!state) {
      state = window.history.state as { responseSuccess?: boolean };
    }
    if (state && state.responseSuccess) {
      this.responseSuccessMsg = 'Deine Antworten wurden erfolgreich gespeichert!';
      setTimeout(() => {
        this.hideAlert = true;
      }, 4000);

      // 3) Nach weiterer 0.5s die Meldung komplett entfernen
      setTimeout(() => {
        this.responseSuccessMsg = null;
        this.hideAlert = false;
      }, 4500);
    }
    this.loadProjects();
  }


  loadProjects(): void {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data.filter(p => p.status === 'Published');
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

