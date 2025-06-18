
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, Navigation } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectResponse } from '../../models/project-response.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-project-view',
  imports: [CommonModule],
  standalone: true,
  providers: [ProjectService],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
  animations: [
    trigger('slideToggle', [
      transition('closed => open', [
        style({ height: '0', overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '*' }))
      ]),
      transition('open => closed', [
        animate('200ms ease-out', style({ height: '0', overflow: 'hidden' }))
      ])
    ])
  ]
})
export class ProjectViewComponent implements OnInit{
projects: Project[] = [];
  loading = true;
  errorMsg = '';
  responseSuccessMsg = '';
  hideAlert = false;
  openedIndex: number | null = null;

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
        this.responseSuccessMsg = '';
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

   toggleProject(i: number): void {
    this.openedIndex = this.openedIndex === i ? null : i;
  }

  openProject(project: Project): void {
    // Navigiert zu /projects/:id
    this.router.navigate(['/projects', project.id]);
  }
}

