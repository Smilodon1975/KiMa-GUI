import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../../services/campaign.service';
import { ProjectService } from '../../services/project.service';
import { PaginatedResult, CampaignUser } from '../../models/user.model';
import { Project } from '../../models/project.model';
import { ProjectResponse } from '../../models/project-response.model';
import { QuestionDef } from '../../models/question-def.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-campaign',
  templateUrl: './admin-campaign.component.html',
  styleUrls: ['./admin-campaign.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AdminCampaignComponent implements OnInit {
  users: CampaignUser[] = []; 
  campaignUsers: CampaignUser[] = [];
  filteredUsers: CampaignUser[] = [];
  selected = new Set<string>();
  allSelected = false;
  page = 1;
  pageSize = 10000;
  totalCount = 0;
  totalPages: number[] = [];         // ← neu
  filterOption: 'all' | 'subscribed' | 'unsubscribed' = 'all';
  campaignName = '';
  attachment?: File;
  message?: string;
  searchText: string = '';
  emailSubject = '';
  emailBody = '';
  emailLink = '';
  sending = false;
  showMessage = true;
  projects: Project[] = [];
  selectedProject?: Project;
  projectResponses: any[] = [];
  selectedFromAnswers = new Set<string>();
  showUserList = false;
  loadingResponses = false;
  responseError = '';
  responses: ProjectResponse[] = [];
  questions: QuestionDef[] = [];
  openResponses = new Set<number>();
  showProjectDropdown = false;
  showProjects = false;

  constructor(private campaignSvc: CampaignService,private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadProjects(); // Projekte laden!
    }

   private loadUsers(): void {
    this.campaignSvc.getCampaignUsers(1, 9999 /*oder beliebig groß*/).subscribe(res => {
      this.campaignUsers = res.items;
      // Zu Beginn keine Filter => alles anzeigen
      this.filteredUsers = [...this.campaignUsers];});
      }
  

  private loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;},
      error: (err) => {
        console.error('Fehler beim Laden der Projekte:', err);}});
  }

  filterRecipients(): void {
    this.selected.clear();
    this.allSelected = false;

    const text = this.searchText.trim().toLowerCase();

    this.filteredUsers = this.campaignUsers.filter(u => {
      // 1) Text suchen (Email oder Username)
      const matchesText =
        !text ||
        u.email.toLowerCase().includes(text) ||
        (u.userName?.toLowerCase().includes(text) ?? false);

      // 2) Abo-Filter
      let matchesAbo = true;
      if (this.filterOption === 'subscribed') {
        matchesAbo = u.newsletterSub;
      } else if (this.filterOption === 'unsubscribed') {
        matchesAbo = !u.newsletterSub;
      }

      return matchesText && matchesAbo;
    });
  }


  toggleAll(): void {
    if (this.allSelected) {
      this.filteredUsers.forEach(u => this.selected.add(u.email));
    } else {
      this.selected.clear();
    }
  }

  toggleOne(email: string): void {
    this.selected.has(email)
      ? this.selected.delete(email)
      : this.selected.add(email);
    this.allSelected = this.filteredUsers.every(u => this.selected.has(u.email));
  }

  onPageChange(newPage: number): void {
    if (newPage === this.page) return;
    this.page = newPage;
    this.loadUsers();
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachment = input.files?.[0];
  }

  onSend(fm: NgForm): void {
    if (!fm.valid || this.allRecipients.length === 0) return;
      this.sending = true;
      this.campaignSvc.sendCampaign(
      this.campaignName,
      this.allRecipients,
      this.attachment,
      this.emailSubject,
      this.emailBody,
      this.emailLink
      ).subscribe({
    next: () => {
      this.message = `Newsletter an ${this.allRecipients.length} Empfänger verschickt.`;
      this.showMessage = true; fm.resetForm();
      this.attachment = undefined;
      this.loadUsers();
      this.sending = false;
        setTimeout(() => this.showMessage = false, 3000);
        setTimeout(() => this.message = '', 4000);},
        error: () => {
          this.message = 'Fehler beim Versand.';
          this.showMessage = true;
          this.sending = false;
          setTimeout(() => this.showMessage = false, 3000);
          setTimeout(() => this.message = '', 4000);
        }
      });
    }

  resetAllRecipients(): void {
    this.selected.clear();
    this.selectedFromAnswers.clear();
    }

  toggleProjectDetails(proj: Project) {
    if (this.selectedProject === proj) {
        this.selectedProject = undefined;
        this.projectResponses = [];
        } else {
        this.selectedProject = proj;
        // Lade Antworten für das Projekt
        this.loadResponses(proj.id);
        }
      }

  toggleAnswerRecipient(email: string) {
      if (this.selectedFromAnswers.has(email)) {
        this.selectedFromAnswers.delete(email);
      } else {
        this.selectedFromAnswers.add(email);
      }
    }

  toggleResponse(idx: number) {
    if (this.openResponses.has(idx)) {
      this.openResponses.delete(idx);
      } else {
        this.openResponses.add(idx);
      }
    }

  selectedFromAnswersArray() {
    return Array.from(this.selectedFromAnswers);
    }

  toggleUserList() {
    this.showUserList = !this.showUserList;
      if (this.showUserList && this.filteredUsers.length === 0) {
        this.loadUsers();
        }
      }

  hideProjectDropdown() {
    setTimeout(() => this.showProjectDropdown = false, 150);
    }

  selectProjectLink(proj: Project) {
    this.emailLink = `${location.origin}/projects/${proj.id}`;
    this.showProjectDropdown = false;
    }

  loadResponses(projectId: number): void {
    this.loadingResponses = true;
    this.responseError = '';
    this.responses = [];
    this.projectService.getResponses(projectId).subscribe({next: (resList) => {
    this.responses = resList;
    this.loadingResponses = false;},error: (err) => {console.error(`Fehler beim Laden der Responses für Projekt ${projectId}:`, err);
    this.responseError = 'Antworten konnten nicht geladen werden.';
    this.loadingResponses = false;}});
      }

  parseAnswers(json: string): Array<{ questionId: number; answer: string }> {
    if (!json) return [];
      let rawArr: any[];
    try {rawArr = JSON.parse(json);} catch {return [];}
      return rawArr.map(item => {
        const qId = item.questionId;
        const ans = item.answer;
        const q = this.questions.find(q => Number(q.id) === Number(qId));
          if (Array.isArray(ans) && ans.length > 0 && Array.isArray(ans[0]) && q?.type === 'checkboxGrid') 
            {
        const rows = q.rows || [];
        const cols = q.options || [];
        const checked: string[] = [];
          ans.forEach((rowArr: boolean[], rIdx: number) => {
          rowArr.forEach((checkedVal: boolean, cIdx: number) => {
            if (checkedVal && rows[rIdx] && cols[cIdx]) {
                checked.push(`${rows[rIdx].label} – ${cols[cIdx].label}`);
              }});});
            return {
            questionId: qId, answer: checked.length ? checked.join('; ') : '–'};
              }
            if (
              Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'boolean' && q?.type === 'checkbox') {
                  const options = q.options || [];
                  const checkedLabels = ans
                    .map((val: boolean, idx: number) => (val && options[idx] ? options[idx].label : null))
                    .filter(label => !!label);
                  return {
                    questionId: qId,
                    answer: checkedLabels.length ? checkedLabels.join(', ') : '–'};}
              if (typeof ans === 'string' || typeof ans === 'number') {
                return { questionId: qId, answer: `${ans}` };
                }
              if (Array.isArray(ans) && ans.length > 0 && typeof ans[0] === 'string') {
                return { questionId: qId, answer: (ans as string[]).join(', ') };
                }
                try {
                  return { questionId: qId, answer: JSON.stringify(ans) };
                } catch {
                  return { questionId: qId, answer: String(ans) };}});
      }


  getQuestionText(questionId: number): string {
    const q = this.questions.find(q => Number(q.id) === Number(questionId));
      return q ? q.text : `Frage ${questionId}`;
    }

  get allRecipients(): string[] {
    return [
      ...Array.from(this.selected),
      ...Array.from(this.selectedFromAnswers)
    ].filter((v, i, a) => !!v && a.indexOf(v) === i);
    }

  openProjectResponseModal(proj: Project): void {
    this.selectedProject = proj;
    this.questions = proj.questionsJson ? JSON.parse(proj.questionsJson) as QuestionDef[] : [];
    this.loadResponses(proj.id);
    const modalEl = document.getElementById('projectResponseModal');
      if (modalEl) {
        const modal = new (window as any).bootstrap.Modal(modalEl);
        modal.show();
      }
    }

  closeProjectResponseModal(): void {
    const modalEl = document.getElementById('projectResponseModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl) || new (window as any).bootstrap.Modal(modalEl);
      modal.hide();}
    this.selectedProject = undefined;
    this.responses = [];
    this.questions = [];
  }


}