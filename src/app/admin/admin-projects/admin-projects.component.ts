import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Project } from '../../models/project.model';
import { ProjectResponse } from '../../models/project-response.model';
import { QuestionDef } from '../../models/question-def.model';
import { ProjectService } from '../../services/project.service';
import * as bootstrap from 'bootstrap';
import { RouterModule } from '@angular/router';
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
    options: [],
    rows: []
  };
  isEditingQuestionIndex: number | null = null;
  private nextQId = 1;
   responses: ProjectResponse[] = [];
  loadingResponses = false;
  responseError = '';

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
        options: [],
        rows: []
      };
    }

    openNewGridQuestion(): void {
    this.newQuestion = {
      id: this.nextQId++,
      type: 'checkboxGrid',
      text: '',
      options: [],
      rows: []
    };
  }

    // Methoden für Spalten (options)
    addOption(): void {
      this.newQuestion.options = this.newQuestion.options ?? [];
      this.newQuestion.options.push({ label: '', value: '', exclude: false });
    }


    // Methoden für Zeilen (rows)
    addRow(): void {
      this.newQuestion.rows = this.newQuestion.rows ?? [];
      this.newQuestion.rows.push({ label: '', value: '', exclude: false });
    }

    removeRow(j: number): void {
      if (this.newQuestion.rows) {
        this.newQuestion.rows.splice(j, 1);
      }
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
          options: this.newQuestion.options ? [...this.newQuestion.options] : undefined,
          // <<< rows mitkopieren, aber nur, wenn definiert >>>
          rows: this.newQuestion.rows ? [...this.newQuestion.rows] : undefined
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
          options: q.options ? q.options.map(o => ({ ...o })) : [],
          // <<< rows ebenfalls übernehmen, wenn vorhanden >>>
          rows: q.rows ? q.rows.map(r => ({ ...r })) : []
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

        openResponseModal(project: Project): void {
        this.selectedProject = project;
        this.loadResponses(project.id!);
        const modalEl = document.getElementById('responseDetailModal');
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      }

        loadResponses(projectId: number): void {
          this.loadingResponses = true;
          this.responseError = '';
          this.responses = [];

          this.projectService.getResponses(projectId).subscribe({
            next: (resList) => {
              this.responses = resList;
              this.loadingResponses = false;
            },
            error: (err) => {
              console.error(`Fehler beim Laden der Responses für Projekt ${projectId}:`, err);
              this.responseError = 'Antworten konnten nicht geladen werden.';
              this.loadingResponses = false;
            }
          });
        }

          closeResponseModal(): void {
          this.responses = [];
          this.loadingResponses = false;
          this.responseError = '';
          this.selectedProject = {};
          const modalEl = document.getElementById('responseDetailModal');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal?.hide();
          }
        }

          parseAnswers(json: string): Array<{ questionId: number; answer: string }> {
        if (!json) {
          return [];
        }

        let rawArr: any[];
        try {
          rawArr = JSON.parse(json);
        } catch {
          return [];
        }

        return rawArr.map(item => {
          const qId = item.questionId;
          const ans = item.answer;

          // 1) Falls Antwort vom Typ String oder Zahl (Freitext, Radio, Select, Date)
          if (typeof ans === 'string' || typeof ans === 'number') {
            return {
              questionId: qId,
              answer: `${ans}` // in String umwandeln
            };
          }

          // 2) Falls einfache Checkbox‐Frage: 'ans' ist Array von Strings oder Array von Booleans
          if (Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'string') {
            // z. B. ["Wert1", "Wert2", ...]
            return {
              questionId: qId,
              answer: (ans as string[]).join(', ')
            };
          }
          if (Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'boolean') {
            // Hier hatten wir in einigen Varianten booleans; 
            // aber normalerweise wird hier schon in Strings konvertiert. 
            // Wir wandeln sie notfalls in kommagetrennte Wahrheitswerte.
            return {
              questionId: qId,
              answer: (ans as boolean[]).map(b => (b ? '✓' : '✗')).join(', ')
            };
          }

          // 3) Falls Grid‐Typ: 'ans' ist Array von { rowValue, colValue }
          if (
            Array.isArray(ans) &&
            ans.length > 0 &&
            typeof ans[0] === 'object' &&
            ('rowValue' in ans[0]) &&
            ('colValue' in ans[0])
          ) {
            // Beispiel: [ { rowValue: "08-10", colValue: "Mo" }, { rowValue: "10-12", colValue: "Di" } ]
            const gridItems = (ans as Array<{ rowValue: string; colValue: string }>).map(
              (g) => `${g.rowValue} – ${g.colValue}`
            );
            return {
              questionId: qId,
              answer: gridItems.join('; ')
            };
          }

          // 4) Fallback: Irgendwas anderes (z. B. leeres Array oder unbekannter Typ)
          // Wir versuchen, ans direkt als JSON‐String auszugeben:
          try {
            return {
              questionId: qId,
              answer: JSON.stringify(ans)
            };
          } catch {
            return {
              questionId: qId,
              answer: String(ans)
            };
          }
        });
      }
    }

