import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { environment } from '../../../environments/environment';
import { Project, ProjectStatus } from '../../models/project.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-automotive-project',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './automotive-project.component.html',
  styleUrl: './automotive-project.component.css'
})
export class AutomotiveProjectComponent implements OnInit{
  project: Project | null = null;
  loading = true;
  error: string | null = null;

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit() {
    const id = environment.automotiveProjectId;
    this.projectService.getById(id).subscribe({
      next: p => {
        this.project = p;
        this.loading = false;
      },
      error: err => {
        this.error = 'Projekt konnte nicht geladen werden.';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
