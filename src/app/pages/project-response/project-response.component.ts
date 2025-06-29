import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { QuestionDef } from '../../models/question-def.model';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
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
  showStart = true;
  emailAlreadyAnswered = false;
  checkingEmail = false;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
        next: proj => {
          this.project = proj;
          this.questions = JSON.parse(proj.questionsJson || '[]');
          this.buildForm();
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.router.navigate(['/']);
        }
      });
    }
 
  private buildForm(): void {
  const userGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  const answerControls = this.questions.map(q => {
    switch (q.type) {
      case 'text':
      case 'textarea':
      case 'date':
      case 'radio':
      case 'select':
        return this.fb.control('', Validators.required);

      case 'checkbox':
        const cbArray = this.fb.array(
          q.options?.map(() => this.fb.control(false)) || [],
          this.minSelected(1)
        );
        return cbArray;

      case 'checkboxGrid':
        const grid = q.rows?.map(_ =>
          this.fb.array(q.options!.map(() => this.fb.control(false)))
        ) || [];
        // Pflichtvalidator: mindestens eine Zelle ausgewählt
        return this.fb.array(grid, this.minGridSelected(1));

      default:
        return this.fb.control('');
    }});
    this.responseForm = this.fb.group({
        user: userGroup,
        answers: this.fb.array(answerControls)
      });
    this.responseForm.get('user.email')?.valueChanges
      .subscribe(() => this.checkIfAlreadyAnswered());
    }

  // Hilfs-Validator: mindestens N Boxen in einem FormArray ausgewählt
  private minSelected(min: number) {
    return (fa: AbstractControl) => {
      const arr = fa as FormArray;
      const total = arr.controls
        .map(ctrl => ctrl.value)
        .reduce((sum, v) => sum + (v ? 1 : 0), 0);
      return total >= min ? null : { minSelected: true };
    };
  }

  // Für Grid: zählt alle Zeilen×Spalten-Zellen durch 
  private minGridSelected(min: number) {
    return (fa: AbstractControl) => {
      const outer = fa as FormArray; // Array<FormArray>
      let total = 0;
      outer.controls.forEach(inner => {
        (inner as FormArray).controls.forEach(c => {
          if (c.value) total++;
        });
      });
      return total >= min ? null : { minGridSelected: true };
    };
  }

  get answers(): FormArray {
    return this.responseForm.get('answers') as FormArray;
  }

  get answersArray() {
    return this.responseForm.get('answers') as FormArray;
  }

   get currentControl(): AbstractControl {
    return this.answersArray.at(this.currentIdx);
  }

  getControl(i: number): FormControl {
    return this.answers.at(i) as FormControl;
  }
  getCheckboxArray(i: number): FormArray {
    return this.answers.at(i) as FormArray;
  }
  getGridArray(i: number): FormArray {
    return this.answers.at(i) as FormArray;
  }
  getGridControl(i: number, r: number, c: number): FormControl {
    return (this.getGridArray(i).at(r) as FormArray).at(c) as FormControl;
  }

   prev(): void {
    if (this.currentIdx > 0) this.currentIdx--;    
  }
  next(): void {
    if (this.currentIdx < this.questions.length - 1) {
      this.currentIdx++;
    } else {
      this.reviewMode = true;
    }
  }

  onSubmit(): void {
    if (this.responseForm.invalid) {
      this.submitError = 'Bitte alle Pflichtfelder ausfüllen.';
      return;
    }
    if (this.emailAlreadyAnswered) {
      this.submitError = 'Für diese E-Mail-Adresse wurde bereits eine Antwort abgegeben.';
      return;
    }
    this.submitting = true;
    const email = this.responseForm.get('user.email')!.value as string;
    const raw = (this.responseForm.value.answers as any[]);
    const payload = this.questions.map((q, i) => {
      const val = raw[i];
      return { questionId: q.id, answer: val };
    });
    this.projectSvc.submitResponse({
      projectId: this.projectId,
      respondentEmail: email,
      answersJson: JSON.stringify(payload)
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        this.submitError = '';
        this.router.navigate(['/projects'], { state: { responseSuccess: true }});
      },
      error: err => {
        console.error(err);
        this.submitting = false;
        this.submitError = 'Fehler beim Absenden.';
      }
    });
  }
  
  public previewAnswer(idx: number): string {
    const q = this.questions[idx];
    const raw = this.answersArray.at(idx).value;

    switch (q.type) {
      case 'text':
      case 'textarea':
      case 'date':
      case 'radio':
      case 'select':
        return raw ?? '';

      case 'checkbox':
        // raw ist ein boolean[]
        return (q.options ?? [])
          .filter((opt, i) => raw[i])
          .map(opt => opt.label)
          .join(', ');

      case 'checkboxGrid':
        // raw ist boolean[][], rows × columns
        const rows = q.rows ?? [];
        const cols = q.options ?? [];
        const sel: string[] = [];
        (raw as boolean[][]).forEach((rowArr, r) =>
          rowArr.forEach((checked, c) => {
            if (checked) {
              sel.push(`${rows[r].label} → ${cols[c].label}`);
            }
          })
        );
        return sel.join('; ');

      default:
        return '';
    }
  }

  checkIfAlreadyAnswered() {
    const email = this.responseForm.get('user.email')?.value;
    if (!email || this.responseForm.get('user.email')?.invalid) {
      this.emailAlreadyAnswered = false;
      return;
    }
    this.checkingEmail = true;
    this.projectSvc.checkResponseExists(this.projectId, email).subscribe({
      next: exists => {
        this.emailAlreadyAnswered = exists;
        this.checkingEmail = false;
      },
      error: () => {
        this.emailAlreadyAnswered = false;
        this.checkingEmail = false;
      }
    });
  }
  
  goToProjectOverview(): void {
    this.router.navigate(['/projects']);
  }

  resetEmailInput() {
    this.responseForm.get('user.email')?.reset('');
    this.emailAlreadyAnswered = false;
    this.checkingEmail = false;    
  }


}
