import { Component, OnInit, AfterViewInit, HostListener  } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Project, ProjectStatus } from '../../models/project.model';
import { ProjectResponse } from '../../models/project-response.model';
import { QuestionDef } from '../../models/question-def.model';
import { ProjectService } from '../../services/project.service';
import * as bootstrap from 'bootstrap';
import { RouterModule, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QuillModule } from 'ngx-quill';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [FormsModule, RouterModule, DragDropModule, QuillModule, DatePipe, CommonModule],
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
    rows: []};
  isEditingQuestionIndex: number | null = null;
  private nextQId = 1;
  responses: ProjectResponse[] = [];
  loadingResponses = false;
  responseError = '';
  draftKey = 'adminProjectDraft';
  dirty = false; 
  isModalMaximized = false;
  openedResponses = new Set<number>();
  projectSearch = '';
  filteredProjects: Project[] = [];
  visibleQuestionIds = new Set<number>();
  displayMode: 'label' | 'value' | 'both' = 'value';
  quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
  };

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
        this.filterProjects();
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

  filterProjects(): void {
  const term = this.projectSearch.trim().toLowerCase();
  this.filteredProjects = !term
    ? this.projects
    : this.projects.filter(p =>
        (p.name || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      );
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
    
  //===========================================================||
  // ----------------- Projekt speichern ----------------------->
  //===========================================================||


  saveProject(form: NgForm, draftOnly: boolean = false): void {
    if (form.invalid) return;
    const isUpdate = this.isEditMode && this.selectedProject.id != null;
    const normalizedQuestions = this.normalizeQuestions(this.questions);
    const payload: Partial<Project> = {
      id: this.selectedProject.id!,
      name: this.selectedProject.name!,
      description: this.selectedProject.description!,
      questionsJson: JSON.stringify(normalizedQuestions),
      status: draftOnly ? ProjectStatus.Draft : this.selectedProject.status
    };
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

    private normalizeOne(q: any): any {
      const clone = JSON.parse(JSON.stringify(q));
      if (Array.isArray(clone.options)) {
        clone.options.forEach((o: any) => { // <-- Typ ergänzt
          if (!o.value) o.value = o.label ?? '';
          delete o._autoValue;
        });
      }
      if (Array.isArray(clone.rows)) {
        clone.rows.forEach((r: any) => { // <-- Typ ergänzt
          if (!r.value) r.value = r.label ?? '';
          delete r._autoValue;
        });
      }
      return clone;
    }

    private normalizeQuestions(questions: any[]): any[] {
      return (questions ?? []).map(q => this.normalizeOne(q));
    }



  saveChanges(): void {
    const normalizedQuestions = this.normalizeQuestions(this.questions);
    const patch = [
      { op: 'replace', path: '/name',           value: this.selectedProject.name      },
      { op: 'replace', path: '/description',    value: this.selectedProject.description },
      { op: 'replace', path: '/questionsJson',  value: JSON.stringify(normalizedQuestions)   },
      { op: 'replace', path: '/status',         value: this.selectedProject.status     }
    ];
    this.projectService.patchProject(this.selectedProject.id!, patch)
      .subscribe({
        next: () => {
          this.successMessage = 'Projekt wurde gespeichert.'; this.dirty = false; sessionStorage.removeItem(this.draftKey);
        },
        error: err => {this.errorMessage = 'Speichern fehlgeschlagen.'; console.error(err);}});
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
       
  //===========================================================||
  // ----------------- Modale öffnen--------------------------->
  //===========================================================||

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
    this.visibleQuestionIds = new Set(this.questions.map(q => q.id)); // alle sichtbar
    this.loadResponses(project.id);
    const modalEl = document.getElementById('responseDetailModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  toggleQuestionVisibility(qId: number): void {
    if (this.visibleQuestionIds.has(qId)) {
      this.visibleQuestionIds.delete(qId);
    } else {
      this.visibleQuestionIds.add(qId);
    }
  }

  //================================================================||
  //------------------ Modale schließen --------------------------->
  //================================================================||

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

      //====================================================================================================||
      // ---------- Projekt "fertig" markieren, veröffentlichen oder zurückziehen --------------------------->
      //====================================================================================================||

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

  //=================================================================||
  // --------- Neue Frage erstellen oder bearbeiten------------------->
  //=================================================================||

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
      options: (q.options ?? []).map(o => ({...o,
        _autoValue: !o.value || o.value === o.label}) as any),
      rows: (q.rows ?? []).map(r => ({...r,
        _autoValue: !r.value || r.value === r.label}) as any)
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
    this.newQuestion.options.push({ label: '', value: '', exclude: false, _autoValue: true } as any);
    this.markDirty();
  }

  addRow(): void {
    this.newQuestion.rows = this.newQuestion.rows ?? [];
    this.newQuestion.rows.push({ label: '', value: '', exclude: false, _autoValue: true } as any);
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

  dropQuestion(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    this.questions.forEach((q, idx) => q.id = idx + 1);
  }

  onOptionLabelChange(i: number, newLabel: string): void {
    const opt: any = this.newQuestion.options?.[i];
    if (!opt) return;
    if (opt._autoValue || !opt.value) {
      opt.value = newLabel ?? '';
    }
    this.markDirty();
  }

  onGridColLabelChange(i: number, newLabel: string): void {
    this.onOptionLabelChange(i, newLabel);
  }

  onRowLabelChange(j: number, newLabel: string): void {
    const row: any = this.newQuestion.rows?.[j];
    if (!row) return;
    if (row._autoValue || !row.value) {
      row.value = newLabel ?? '';
    }
    this.markDirty();
  }

  markOptionValueManual(i: number): void {
    const opt: any = this.newQuestion.options?.[i];
    if (opt) opt._autoValue = false;
  }

  markGridColValueManual(i: number): void {
    this.markOptionValueManual(i);
  }

  markRowValueManual(j: number): void {
    const row: any = this.newQuestion.rows?.[j];
    if (row) row._autoValue = false;
  }

  //=================================================================||
  // ----------------- Responses laden ------------------------------->
  //=================================================================||


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

  deleteResponse(response: ProjectResponse): void {
  if (!confirm('Antwort wirklich löschen?')) return;

  const projectId = this.selectedProject.id;
  if (projectId == null) {
    this.responseError = 'Projekt-ID fehlt, Antwort kann nicht gelöscht werden.';
    return;
  }
  this.loadingResponses = true;
  this.responseError = '';
  if (response.id == null) {
    this.responseError = 'Antwort-ID fehlt, Antwort kann nicht gelöscht werden.';
    this.loadingResponses = false;
    return;
  }
  this.projectService
    .deleteResponse(projectId, response.id!)
    .subscribe({
      next: () => this.loadResponses(projectId),
      error: err => {
        console.error('Fehler beim Löschen:', err);
        this.responseError = 'Antwort konnte nicht gelöscht werden.';
        this.loadingResponses = false;
      }
    });
  }

  parseAnswers(json: string, mode: 'label' | 'value' | 'both' = this.displayMode)
    : Array<{ questionId: number; answer: string }> {
      if (!json) return [];
      let rawArr: any[];
      try { rawArr = JSON.parse(json); } catch { return []; }

      return rawArr.map(item => {
        const qId = item.questionId;
        const ans = item.answer;
        const q = this.questions.find(q => Number(q.id) === Number(qId));

        if (Array.isArray(ans) && ans.length > 0 && Array.isArray(ans[0]) && q?.type === 'checkboxGrid') {
          const rows = q.rows || [];
          const cols = q.options || [];
          const picked: string[] = [];
          ans.forEach((rowArr: boolean[], rIdx: number) => {
            rowArr.forEach((isOn: boolean, cIdx: number) => {
              if (isOn && rows[rIdx] && cols[cIdx]) {
                picked.push(`${this.formatPair(rows[rIdx], mode)} – ${this.formatPair(cols[cIdx], mode)}`);
              }
            });
          });
          return { questionId: qId, answer: picked.length ? picked.join('; ') : '–' };
        }
        if (Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'boolean' && q?.type === 'checkbox') {
          const opts = q.options || [];
          const picked = ans
            .map((on: boolean, idx: number) => (on && opts[idx] ? this.formatPair(opts[idx], mode) : null))
            .filter((x: string|null) => !!x) as string[];
          return { questionId: qId, answer: picked.length ? picked.join(', ') : '–' };
        }
        if ((typeof ans === 'string' || typeof ans === 'number') && q?.options?.length) {
          const s = String(ans);
          const opt = q.options.find(o => String(o.value) === s || String(o.label) === s);
          return { questionId: qId, answer: opt ? this.formatPair(opt, mode) : s };
        }
        if (typeof ans === 'string' || typeof ans === 'number') return { questionId: qId, answer: String(ans) };
        if (Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'string') {
          return { questionId: qId, answer: (ans as string[]).join(', ') };
        }
        try { return { questionId: qId, answer: JSON.stringify(ans) }; }
        catch { return { questionId: qId, answer: String(ans) }; }
      });
    }

  private formatPair(opt: any, mode: 'label'|'value'|'both'): string {
    const l = opt?.label ?? '';
    const v = opt?.value ?? l;
    if (mode === 'label') return l;
    if (mode === 'both')  return (!l || l === v) ? v : `${l} (${v})`;
    return v; // 'value'
  }

  getAnswer(resp: any, qId: number, mode: 'label'|'value'|'both' = this.displayMode): any {
  const q = this.questions.find(q => q.id === qId);
  const a = this.parseAnswers(resp.answersJson, mode).find(x => x.questionId === qId);
  // Für Checkbox-Fragen: Versuche das Original-Array zurückzugeben
  if (q?.type === 'checkbox' && a && resp.answersJson) {
    try {
      const rawArr = JSON.parse(resp.answersJson);
      const raw = rawArr.find((x: any) => x.questionId === qId);
      if (raw && Array.isArray(raw.answer)) return raw.answer;
    } catch {}
  }
  return a ? a.answer : '';
}

  getAnswerLabel(resp: any, q: any): string {
    const value = this.getAnswer(resp, q.id);
    const option = q.options?.find((o: any) => o.value === value);
    return option ? option.label : value;
  }

  isExcludedOption(q: any, value: any): boolean {
    const option = q.options?.find((o: any) => o.value === value);
    return !!option?.exclude;
  }

  getCheckedOptions(resp: any, q: any): any[] {
    const values = this.getAnswer(resp, q.id);
    if (!Array.isArray(values)) return [];
    return q.options?.filter((opt: any, idx: number) => values[idx]) || [];
  }

  isLastCheckedOption(opt: any, resp: any, q: any): boolean {
    const checked = this.getCheckedOptions(resp, q);
    return checked[checked.length - 1] === opt;
  }

  showAllQuestions(): void {
    this.visibleQuestionIds = new Set(this.questions.map(q => q.id));
  }

  hideAllQuestions(): void {
    this.visibleQuestionIds.clear();
  }


    //===========================================================||
    // ----------------- ungespeicherte Daten ------------------->
    //===========================================================||

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

    toggleResponse(idx: number): void {
      if (this.openedResponses.has(idx)) {
        this.openedResponses.delete(idx);
      } else {
        this.openedResponses.add(idx);
      }
    }

  //================================================================||
  // ----------------- Ende der Anwendung --------------------------->
  //================================================================||

  getRowLabels(rows: any[]): string {
  return Array.isArray(rows) ? rows.map(r => r.label).join(', ') : '';
  }

  isDateQuestion(qId: number): boolean {
    const q = this.questions.find(q => q.id === qId);
    return q?.type === 'date';
  }

  displayAnswer(resp: any, q: any): string {
    const value = this.getAnswer(resp, q.id);

    // Einzelauswahl (Radio/Select)
    if ((q.type === 'radio' || q.type === 'select') && q.options) {
      const opt = q.options.find((o: any) => String(o.value) === String(value));
      if (!opt) return value ?? '';
      let label = opt.label;
      let intern = opt.value;
      let ex = opt.exclude ? ' (Exkl.)' : '';
      if (this.displayMode === 'label') return label + ex;
      if (this.displayMode === 'value') return intern + ex;
      return `${label} (${intern})${ex}`;
    }

    // Mehrfachauswahl (Checkbox)
    if (q.type === 'checkbox' && q.options) {
      // value kann ein Array von booleans oder Werten sein
      let arr: string[] = [];
      if (Array.isArray(value)) {
        arr = q.options
          .map((opt: any, idx: number) => {
            // Boolean-Array (klassisch Angular)
            if (typeof value[idx] === 'boolean' && value[idx]) {
              const ex = opt.exclude ? ' (Exkl.)' : '';
              if (this.displayMode === 'label') return opt.label + ex;
              if (this.displayMode === 'value') return opt.value + ex;
              return `${opt.label} (${opt.value})${ex}`;
            }
            // Value-Array (z.B. ['A1','B2'])
            if (typeof value[idx] !== 'undefined' && value.includes && value.includes(opt.value)) {
              const ex = opt.exclude ? ' (Exkl.)' : '';
              if (this.displayMode === 'label') return opt.label + ex;
              if (this.displayMode === 'value') return opt.value + ex;
              return `${opt.label} (${opt.value})${ex}`;
            }
            return null;
          })
          .filter((x: string | null): x is string => !!x);
      }
      return arr.length ? arr.join(', ') : '–';
    }

    // Datum
    if (q.type === 'date' && value) {
      return new Date(value).toLocaleDateString('de-DE');
    }

    // Freitext oder Fallback
    return value ?? '–';
  }
}

