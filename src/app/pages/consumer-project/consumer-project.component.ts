import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { environment } from '../../../environments/environment';
import { Project, ProjectStatus } from '../../models/project.model';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-consumer-project',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './consumer-project.component.html',
  styleUrl: './consumer-project.component.css'
})
export class ConsumerProjectComponent implements OnInit{
  project: Project | null = null;
  loading = true;
  error: string | null = null;

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit() {
    const id = environment.consumerProjectId;
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
