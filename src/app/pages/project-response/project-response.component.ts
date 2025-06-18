
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { QuestionDef } from '../../models/question-def.model';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-project-response',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './project-response.component.html',
  styleUrls: ['./project-response.component.css']
})
export class ProjectResponseComponent implements OnInit {
  projectId!: number;
  project?: Project;
  questions: QuestionDef[] = [];
  responseForm!: FormGroup;
  respondentEmail = '';
  loading = true;
  submitting = false;
  submitSuccess = false;
  submitError = '';
  currentIdx = 0;
  reviewMode = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private projectSvc: ProjectService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.projectId)) {
      this.router.navigate(['/']);
      return;
    }

    this.projectSvc.getById(this.projectId).subscribe({
      next: (proj) => {
        this.project = proj;
        if (proj.questionsJson) {
          try {
            this.questions = JSON.parse(proj.questionsJson);
          } catch {
            this.questions = [];
          }
        }
        this.buildForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Projekt konnte nicht geladen werden:', err);
        this.router.navigate(['/']);
      }
    });
  }

  private buildForm(): void {
    const controlsArray = this.questions.map((q) => {
      switch (q.type) {
        case 'text':
        case 'textarea':
        case 'date':
        case 'radio':
        case 'select':
          return this.fb.control('', Validators.required);

        case 'checkbox':
          const arr = q.options?.map(() => this.fb.control(false)) ?? [];
          return this.fb.array(arr);

        case 'checkboxGrid':
          // erstelle pro Zeile ein FormArray mit einer Kontrolle pro Spalte
          const gridRows = q.rows?.map(_ =>
            this.fb.array(q.options!.map(_ => this.fb.control(false)))
          ) ?? [];
          return this.fb.array(gridRows);
        default:
          return this.fb.control('');
      }
    });

    this.responseForm = this.fb.group({
      answers: this.fb.array(controlsArray)
    });
  }

  get answersArray() {
    return this.responseForm.get('answers') as FormArray;
  }

  getAnswerControl(index: number): FormControl {
    return this.answersArray.at(index) as FormControl;
  }

  getCheckboxControl(i: number, j: number): FormControl {
    const checkboxArray = this.answersArray.at(i) as FormArray;
    return checkboxArray.at(j) as FormControl;
  }

      /** Gibt das FormArray für eine bestimmte Frage zurück */
    getGridArray(qIndex: number): FormArray {
      return this.answersArray.at(qIndex) as FormArray;
    }

    /** Greift auf die Checkbox-Control in Zeile r, Spalte c zu */
    getGridControl(qIndex: number, r: number, c: number): FormControl {
      const matrix = this.getGridArray(qIndex).at(r) as FormArray;
      return matrix.at(c) as FormControl;
    }


  onSubmit(): void {  
  if (this.responseForm.invalid || !this.respondentEmail) {
    this.submitError = 'Bitte beantworte alle Fragen und gib deine E-Mail ein.';
    this.submitSuccess = false;
    return;
  }
  this.submitting = true;
  const raw = this.responseForm.value.answers as any[];
  const answerPayload = this.questions.map((q, idx) => {
    const controlValue = raw[idx];
    switch (q.type) {
      case 'text':
      case 'textarea':
      case 'date':
      case 'radio':
      case 'select':
        return { questionId: q.id, answer: controlValue };
      case 'checkbox':
        const selectedValues = q.options
          ?.filter((opt, optIdx) => controlValue[optIdx])
          .map((opt) => opt.value) ?? [];
        return {
          questionId: q.id,
          answer: selectedValues.join(',')
        };
      case 'checkboxGrid':
        const matrix = raw[idx] as boolean[][];
        const selections: { rowValue: string, colValue: string }[] = [];

        matrix.forEach((rowSel, r) => {
          rowSel.forEach((checked, c) => {
            if (checked) {
              selections.push({
                rowValue: q.rows![r].label,
                colValue: q.options![c].label
              });
            }
          });
        });
        return { questionId: q.id, answer: selections };
      default:
        return { questionId: q.id, answer: controlValue };
    }
  });
  const payload = {
    projectId: this.projectId,
    respondentEmail: this.respondentEmail,
    answersJson: JSON.stringify(answerPayload)
  };
  this.projectSvc.submitResponse(payload).subscribe({
    next: () => {
      this.submitting = false;  
      this.submitSuccess = true;
      this.submitError = '';
      this.responseForm.reset();
      this.router.navigate(['/projects'], {
          state: { responseSuccess: true }
        });
    },
    error: (err) => {
      console.error('Fehler beim Absenden der Antworten:', err);
      this.submitting = false; 
      this.submitError = 'Fehler beim Absenden. Bitte versuche es später erneut.';
      this.submitSuccess = false;
    }
  });
}

}