import { Component, OnInit, AfterViewInit, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Project, ProjectStatus } from '../../models/project.model';
import { ProjectResponse } from '../../models/project-response.model';
import { QuestionDef } from '../../models/question-def.model';
import { ProjectService } from '../../services/project.service';
import * as bootstrap from 'bootstrap';
import { RouterModule, Router } from '@angular/router';



@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-projects.component.html',
  styleUrls: ['./admin-projects.component.css']
})
export class AdminProjectsComponent implements OnInit, AfterViewInit {
  projects: Project[] = [];  
  selectedProject: Project = {} as Project;
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
  draftKey = 'adminProjectDraft';
  dirty = false; 

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    const draft = sessionStorage.getItem(this.draftKey);
    if (draft) {
    const obj = JSON.parse(draft);
    if (obj.selectedProject) {
    this.selectedProject = obj.selectedProject as Project;
    this.isEditMode = !!this.selectedProject.id;
      }
    this.questions = obj.questions || [];
    this.nextQId   = obj.nextQId   || 1;
    this.newQuestion = obj.newQuestion || this.newQuestion;
    this.dirty = true;
    }
    this.loadAllProjects();
    }

  loadAllProjects(): void {
    this.projectService.getAll().subscribe({
      next: (data) => {
        console.log('API-Projekte:', data);
        this.projects = data.map(p => ({          
          ...p,
          status: p.status || ProjectStatus.Draft
        }));
      },
      error: (err) => {
        console.error('Fehler beim Laden der Projekte:', err);
        this.errorMessage = 'Projekte konnten nicht geladen werden.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  public markDirty(): void {
    this.dirty = true;
    this.saveDraft();
    }

  @HostListener('window:beforeunload', ['$event'])
    handleBeforeUnload(event: BeforeUnloadEvent) {
      if (this.dirty) {
    // Standard-Dialogfeld für ungesicherte Änderungen auslösen
      event.returnValue = true;
    }
  }

  ngAfterViewInit(): void {
    const modalEl = document.getElementById('projectModal');
    if (modalEl) {     
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetFormState();
      });
    }
  }

  private resetFormState(): void {
    this.selectedProject = {} as Project;
    this.questions = [];
    this.resetNewQuestion();
    this.nextQId = 1;
    this.isEditMode = false;
    this.isEditingQuestionIndex = null;
    this.successMessage = '';
    this.errorMessage = '';  
    sessionStorage.removeItem(this.draftKey);
    this.dirty = false;
  }
    
  // ----------------- Projekt speichern --------------------------->


  saveProject(form: NgForm, draftOnly: boolean = false): void {
    if (form.invalid) return;
    const jsonQuestions = JSON.stringify(this.questions);
    const isUpdate = this.isEditMode && this.selectedProject.id != null;
    const payload: Partial<Project> = {
      id: this.selectedProject.id!,
      name: this.selectedProject.name!,
      description: this.selectedProject.description!,
      questionsJson: JSON.stringify(this.questions),
      status: draftOnly ? ProjectStatus.Draft : this.selectedProject.status};
    if (isUpdate) {
      this.updateExistingProject(this.selectedProject.id!, payload, draftOnly);
    } else {
      this.createNewProject(payload, draftOnly);
    }
  }

  private createNewProject(
    payload: Partial<Project>,
    draftOnly: boolean
    ): void {
    this.projectService.createProject(payload).subscribe({
      next: (proj) => {
        this.successMessage = draftOnly
          ? 'Projekt zwischengespeichert.'
          : 'Neues Projekt wurde angelegt.';
        setTimeout(() => (this.successMessage = ''), 3000);
        this.dirty = false; sessionStorage.removeItem(this.draftKey);
        this.loadAllProjects();
        if (draftOnly && proj?.id) {
        this.selectedProject.id = proj.id;
        this.isEditMode = true;
      }
        if (!draftOnly) this.closeModal();
      },
      error: (err) => {
        console.error('Fehler beim Anlegen:', err);
        this.errorMessage = draftOnly
          ? 'Fehler beim Zwischenspeichern.'
          : 'Fehler beim Anlegen.';
        setTimeout(() => (this.errorMessage = ''), 3000);
        }
      });
    }

  private updateExistingProject(
    id: number,
    payload: Partial<Project>,
    draftOnly: boolean
    ): void {
    if (draftOnly) {
    const patch: any[] = [
      { op: 'replace', path: '/name',           value: payload.name },
      { op: 'replace', path: '/description',    value: payload.description },
      { op: 'replace', path: '/questionsJson',  value: payload.questionsJson },
      { op: 'replace', path: '/status',         value: payload.status }
    ];
    this.projectService.patchProject(id, patch).subscribe({
      next: () => {
        this.successMessage = 'Projekt zwischengespeichert.';
        setTimeout(() => (this.successMessage = ''), 3000);
        this.dirty = false;
        sessionStorage.removeItem(this.draftKey);
        this.loadAllProjects();
      },
      error: (err) => {
        console.error('Fehler beim Zwischenspeichern:', err);
        this.errorMessage = 'Fehler beim Zwischenspeichern.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
      } else {
        this.projectService.updateProject(id, payload).subscribe({
          next: () => {
            this.successMessage = 'Projekt wurde aktualisiert.';
            setTimeout(() => (this.successMessage = ''), 3000);
            this.dirty = false;
            sessionStorage.removeItem(this.draftKey);
            this.loadAllProjects();
            this.closeModal();
          },
          error: (err) => {
            console.error('Fehler beim Aktualisieren:', err);
            this.errorMessage = 'Fehler beim Aktualisieren.';
            setTimeout(() => (this.errorMessage = ''), 3000);
          }});}
    }


  saveChanges(): void {
    const patch = [
      { op: 'replace', path: '/name',           value: this.selectedProject.name      },
      { op: 'replace', path: '/description',    value: this.selectedProject.description },
      { op: 'replace', path: '/questionsJson',  value: JSON.stringify(this.questions)   },
      { op: 'replace', path: '/status',         value: this.selectedProject.status     }
    ];
    this.projectService.patchProject(this.selectedProject.id!, patch)
      .subscribe({
        next: () => {
          this.successMessage = 'Projekt wurde gespeichert.';
          this.dirty = false;
          sessionStorage.removeItem(this.draftKey);
        },
        error: err => {
          this.errorMessage = 'Speichern fehlgeschlagen.';
          console.error(err);
        }});
      }

  private saveDraft(): void {
    sessionStorage.setItem(this.draftKey, JSON.stringify({
    selectedProject: {
    id:             this.selectedProject.id,
    name:           this.selectedProject.name,
    description:    this.selectedProject.description
    },
    questions:      this.questions,
    nextQId:        this.nextQId,
    newQuestion:    this.newQuestion
    }));
  }
       
  // ----------------- Modale öffnen--------------------------->

  private openModalById(modalId: string): void {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openNewModal(): void {
    this.isEditMode = false;
    this.selectedProject = {} as Project;
    this.questions = [];
    this.nextQId = 1;
    this.resetNewQuestion();
    this.openModalById('projectModal');
  }
  
  openEditModal(proj: Project): void {
    const detailEl = document.getElementById('projectDetailModal');
    if (detailEl) {
      const detailModal = bootstrap.Modal.getInstance(detailEl);
      detailModal?.hide();
    }
    this.isEditMode = true;
    this.selectedProject = proj;
    this.questions = proj.questionsJson
      ? JSON.parse(proj.questionsJson) as QuestionDef[]
      : [];
    this.nextQId = this.questions.length
      ? Math.max(...this.questions.map(q => q.id)) + 1
      : 1;
    this.resetNewQuestion();
    this.openModalById('projectModal');
  }

  openCopyModal(proj: Project): void {
  this.closeDetailModal();
  const newProject: Project = {
    ...JSON.parse(JSON.stringify(proj)),
    id: undefined,
    name: '',
    status: 'Draft',
    createdAt: undefined,
    };
    this.selectedProject = newProject;
    this.isEditMode = false;
    this.questions = proj.questionsJson ? JSON.parse(proj.questionsJson) : [];
    this.nextQId = this.questions.length
      ? Math.max(...this.questions.map(q => q.id)) + 1
      : 1;
    this.resetNewQuestion();
    this.openModalById('projectModal');
    }

  
  openDetailModal(proj: Project): void {
    this.isDetailMode = true;
    this.selectedProject = proj;
    this.questions = proj.questionsJson
      ? JSON.parse(proj.questionsJson) as QuestionDef[]
      : [];
    this.openModalById('projectDetailModal');
  }

  openResponseModal(project: Project): void {
    this.selectedProject = project;
    this.questions = project.questionsJson
      ? JSON.parse(project.questionsJson) as QuestionDef[]
      : [];
    this.loadResponses(project.id); // <-- Antworten laden!
    const modalEl = document.getElementById('responseDetailModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }


  //------------------ Modale schließen --------------------------->

  closeModal(): void {
    console.log('closeModal called');
    if (this.dirty) {
    const confirmDiscard = confirm(
      'Du hast ungespeicherte Änderungen. Wirklich alle verwerfen?'
    );
    if (!confirmDiscard) {
    return; 
    }
    }
      const modalEl = document.getElementById('projectModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }
    }


  closeDetailModal(): void {
    console.log('closeModal called');
    const modalEl = document.getElementById('projectDetailModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      this.isDetailMode = false;
    }
  }

  closeResponseModal(): void {
        this.responses = [];
        this.loadingResponses = false;
        this.responseError = '';
        this.selectedProject = {} as Project;
        this.questions = []; // <-- hier Fragen zurücksetzen
        const modalEl = document.getElementById('responseDetailModal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modal.hide();
        }
      }

 // ---------- Projekt "fertig" markieren, veröffentlichen oder zurückziehen --------------------------->

  finishProject(proj: Project): void {
    this.projectService
      .updateStatus(proj.id, ProjectStatus.Finished)
      .subscribe({
        next: () => {
          proj.status = ProjectStatus.Finished;
        },
        error: (err) => {
          console.error('Status-Update fehlgeschlagen:', err);
        }
      });
    }

  publishProject(proj: Project): void {
    this.projectService
      .updateStatus(proj.id, ProjectStatus.Published)
      .subscribe({
        next: () => {
          proj.status = ProjectStatus.Published;
        },
        error: (err) => {
          console.error('Status-Update fehlgeschlagen:', err);
        }
      });
    }

  unpublishProject(proj: Project): void {
    this.projectService
      .updateStatus(proj.id, ProjectStatus.Finished)
      .subscribe({
        next: () => {
          proj.status = ProjectStatus.Finished;
        },
        error: (err) => {
          console.error('Status-Update fehlgeschlagen:', err);
        }
      });
    }

  deleteProject(id: number): void {
    if (!confirm('Willst du dieses Projekt wirklich löschen?')) return;
    this.projectService.delete(id).subscribe({
      next: () => {
        this.closeDetailModal();
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

  // ----------------- Neue Frage erstellen oder bearbeiten--------------------------->

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
      this.markDirty();
    } else {
      this.questions.push(q);
      this.nextQId++;
      this.markDirty();
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
    this.markDirty();
  }


  deleteQuestion(index: number): void {
  this.questions.splice(index, 1);
  this.markDirty();
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

  addOption(): void {
    this.newQuestion.options = this.newQuestion.options ?? [];
    this.newQuestion.options.push({ label: '', value: '', exclude: false });
    this.markDirty();
  }

  addRow(): void {
    this.newQuestion.rows = this.newQuestion.rows ?? [];
    this.newQuestion.rows.push({ label: '', value: '', exclude: false });
    this.markDirty();
  }

  removeRow(j: number): void {
    this.newQuestion.rows!.splice(j, 1);
    this.markDirty();
    }

  removeOption(index: number) {
    this.newQuestion.options!.splice(index, 1);
    this.markDirty();  
  }

  // ----------------- Responses laden --------------------------->


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

  parseAnswers(json: string): Array<{ questionId: number; answer: string }> {
    if (!json) return [];

    let rawArr: any[];
    try {
      rawArr = JSON.parse(json);
    } catch {
      return [];
    }
    return rawArr.map(item => {
      const qId = item.questionId;
      const ans = item.answer;
      const q = this.questions.find(q => Number(q.id) === Number(qId));
      if (
        Array.isArray(ans) &&
        ans.length > 0 &&
        Array.isArray(ans[0]) &&
        q?.type === 'checkboxGrid'
      ) {
        const rows = q.rows || [];
        const cols = q.options || [];
        const checked: string[] = [];
        ans.forEach((rowArr: boolean[], rIdx: number) => {
          rowArr.forEach((checkedVal: boolean, cIdx: number) => {
            if (checkedVal && rows[rIdx] && cols[cIdx]) {
              checked.push(`${rows[rIdx].label} – ${cols[cIdx].label}`);
            }
          });
        });
        return {
          questionId: qId,
          answer: checked.length ? checked.join('; ') : '–'
        };
      }
      if (
        Array.isArray(ans) &&
        ans.length > 0 &&
        typeof ans[0] === 'boolean' &&
        q?.type === 'checkbox'
      ) {
        const options = q.options || [];
        const checkedLabels = ans
          .map((val: boolean, idx: number) => (val && options[idx] ? options[idx].label : null))
          .filter(label => !!label);
        return {
          questionId: qId,
          answer: checkedLabels.length ? checkedLabels.join(', ') : '–'
        };
      }
      if (typeof ans === 'string' || typeof ans === 'number') {
        return { questionId: qId, answer: `${ans}` };
      }
      if (Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'string') {
        return { questionId: qId, answer: (ans as string[]).join(', ') };
      }
      try {
        return { questionId: qId, answer: JSON.stringify(ans) };
      } catch {
        return { questionId: qId, answer: String(ans) };
      }
    });
  }



    // ----------------- ungespeicherte Daten --------------------------->

  canDeactivate(): boolean {
    if (this.questions.length > 0 || this.newQuestion.text) {
    return confirm('Du hast ungespeicherte Änderungen. Wirklich abbrechen?');
    }
    return true;
    }


    getQuestionText(questionId: number): string {
      const q = this.questions.find(q => Number(q.id) === Number(questionId));
      return q ? q.text : `Frage ${questionId}`;
    }

  // ----------------- Ende der Anwendung --------------------------->
}

