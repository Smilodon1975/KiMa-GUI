import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Project } from '../models/project.model';
import { QuestionDef } from '../models/question-def.model';
import { ProjectService } from '../services/project.service';
import * as bootstrap from 'bootstrap';
import { RouterModule } from '@angular/router';
import { AdminGuard } from '../services/admin.guard';
import { Router } from '@angular/router';

interface Question {
  text: string;
}

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-projects.component.html',
  styleUrls: ['./admin-projects.component.css']
})
export class AdminProjectsComponent implements OnInit {
  projects: Project[] = [];
  // selectedProject: Partial<Project> & { questionsJson?: string } = {};
  selectedProject: Partial<Project> = {};
  isDetailMode = true; 
  isEditMode = false;
  successMessage = '';
  errorMessage = '';
  questions: QuestionDef[] = [];
  newQuestion: Partial<QuestionDef> = {
    id: 0,
    type: 'text',
    text: '',
    options: []
  };
  isEditingQuestionIndex: number | null = null;
  private nextQId = 1;

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadAllProjects();
  }

  loadAllProjects(): void {
    this.projectService.getAll().subscribe({
      next: (data) => this.projects = data,
      error: (err) => {
        console.error('Fehler beim Laden der Projekte:', err);
        this.errorMessage = 'Projekte konnten nicht geladen werden.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }


    openNewModal(): void {
      this.isEditMode = false;
      this.selectedProject = {};
      // beim neuen Projekt: leere Frage‐Liste
      this.questions = [];
      this.openModalById('projectModal');
    }


      openEditModal(project: Partial<Project>): void {
      this.isEditMode = true;
      this.selectedProject = { ...project };
      if (project.questionsJson) {
        try {
          this.questions = JSON.parse(project.questionsJson)  as QuestionDef[];
          this.nextQId = Math.max(...this.questions.map(q => q.id)) + 1;
        } catch {
          this.questions = [];
        }
      } else {
        this.questions = [];
      }
      this.resetNewQuestion();
      const modalEl = document.getElementById('projectModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }  
    }


    resetNewQuestion() {
      this.newQuestion = {
        id: this.nextQId,
        type: 'text',
        text: '',
        options: []
      };
    }

  addOption() {
    this.newQuestion.options = this.newQuestion.options || [];
    this.newQuestion.options.push({ value: '', label: '', exclude: false });
  }

  removeOption(index: number) {
    this.newQuestion.options!.splice(index, 1);
  }
  private openModalById(id: string): void {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }


  saveProject(form: NgForm): void {
    if (form.invalid) return;
    const jsonQuestions = JSON.stringify(this.questions);
    if (this.isEditMode && this.selectedProject.id != null) {
      this.projectService.update(this.selectedProject.id, {
         id: this.selectedProject.id, 
        name: this.selectedProject.name!,
        description: this.selectedProject.description!,
        questionsJson: jsonQuestions
      }).subscribe({
        next: () => {
          this.successMessage = 'Projekt wurde aktualisiert.';
          setTimeout(() => (this.successMessage = ''), 3000);
          this.loadAllProjects();
          this.closeModal();
        },
        error: (err) => {
          console.error('Fehler beim Aktualisieren:', err);
          this.errorMessage = 'Fehler beim Aktualisieren.';
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      });
    } else {
      this.projectService.create({
        name: this.selectedProject.name!,
        description: this.selectedProject.description!,
        questionsJson: jsonQuestions
      }).subscribe({
        next: () => {
          this.successMessage = 'Neues Projekt wurde angelegt.';
          setTimeout(() => (this.successMessage = ''), 3000);
          this.loadAllProjects();
          this.closeModal();
        },
        error: (err) => {
          console.error('Fehler beim Anlegen:', err);
          this.errorMessage = 'Fehler beim Anlegen.';
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      });
    }
  }

  deleteProject(id: number): void {
    if (!confirm('Willst du dieses Projekt wirklich löschen?')) return;
    this.projectService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Projekt wurde gelöscht.';
        setTimeout(() => (this.successMessage = ''), 3000);
        this.loadAllProjects();
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        this.errorMessage = 'Fehler beim Löschen.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  closeModal(): void {
    const modalEl = document.getElementById('projectModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
  }

      addQuestion(): void {
      if (!this.newQuestion.text) return;
      const q: QuestionDef = {
        id: this.newQuestion.id!,
        type: this.newQuestion.type!,
        text: this.newQuestion.text!,
        options: this.newQuestion.options ? [...this.newQuestion.options] : undefined
      };
      if (this.isEditingQuestionIndex !== null) {
        this.questions[this.isEditingQuestionIndex] = q;
        this.isEditingQuestionIndex = null;
      } else {
        this.questions.push(q);
        this.nextQId++;
      }
      this.resetNewQuestion();
    }



      editQuestion(idx: number): void {
      const q = this.questions[idx];
      this.newQuestion = {
        id: q.id,
        type: q.type,
        text: q.text,
        options: q.options ? q.options.map(o => ({ ...o })) : []
      };
      this.isEditingQuestionIndex = idx;
    }


  
    deleteQuestion(index: number): void {
    this.questions.splice(index, 1);
    }

 
  openDetailModal(project: Project): void {
    this.isDetailMode = true;
    this.selectedProject = { ...project };
    if (project.questionsJson) {
      try {
        this.questions = JSON.parse(project.questionsJson);
      } catch {
        this.questions = [];
      }
    } else {
      this.questions = [];
    }
    this.openModalById('projectDetailModal');
  }

  closeDetailModal(): void {
    const modalEl = document.getElementById('projectDetailModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      this.isDetailMode = false;
    }
  }
  
}
