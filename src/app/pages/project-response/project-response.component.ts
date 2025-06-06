
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
  respondentEmail: string = '';
  loading: boolean = true;

  // <<< Neue Properties für Meldungen nach Submit >>>
  submitSuccess: boolean = false;
  submitError: string = '';

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
        const cols = q.options?.length ?? 0;
        const rows = q.rows?.length ?? 0;
        const total = cols * rows;
        const gridControls = Array(total).fill(0).map(() => this.fb.control(false));
        return this.fb.array(gridControls);

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

  onSubmit(): void {
  // 1) Validierung
  if (this.responseForm.invalid || !this.respondentEmail) {
    this.submitError = 'Bitte beantworte alle Fragen und gib deine E-Mail ein.';
    this.submitSuccess = false;
    return;
  }

  // 2) Raw-Array aus dem FormArray auslesen
  const raw = this.responseForm.value.answers as any[];

  // 3) answerPayload aufbauen
  const answerPayload = this.questions.map((q, idx) => {
    const controlValue = raw[idx];

    switch (q.type) {
      // a) Text, Textarea, Date, Radio, Select: Wert direkt übernehmen
      case 'text':
      case 'textarea':
      case 'date':
      case 'radio':
      case 'select':
        return { questionId: q.id, answer: controlValue };

      // b) Einfache Checkbox-Frage (Mehrfachauswahl)
      case 'checkbox':
        const selectedValues = q.options
          ?.filter((opt, optIdx) => controlValue[optIdx])
          .map((opt) => opt.value) ?? [];
        return {
          questionId: q.id,
          // Hier als Komma-String gespeichert, kann aber auch Array sein, je nach API-Logik
          answer: selectedValues.join(',')
        };

      // c) Termintabelle (Checkbox-Grid)
      case 'checkboxGrid':
        const cols = q.options?.length ?? 0;
        const rows = q.rows ?? [];
        const colsArr = q.options ?? [];
        const selections: { rowValue: string; colValue: string }[] = [];

        // controlValue ist hier ein eindimensionales Boolean-Array der Länge rows×cols
        rows.forEach((row, rIdx) => {
          colsArr.forEach((col, cIdx) => {
            const flatIndex = rIdx * cols + cIdx;
            if (controlValue[flatIndex]) {
              selections.push({ rowValue: row.value, colValue: col.value });
            }
          });
        });

        return { questionId: q.id, answer: selections };

      // d) Fallback: falls ein neuer Typ dazukommt
      default:
        return { questionId: q.id, answer: controlValue };
    }
  });

  // 4) Payload zusammenstellen
  const payload = {
    projectId: this.projectId,
    respondentEmail: this.respondentEmail,
    answersJson: JSON.stringify(answerPayload)
  };

  // 5) Absenden und Rückmeldung setzen
  this.projectSvc.submitResponse(payload).subscribe({
    next: () => {
      this.submitSuccess = true;
      this.submitError = '';
      // Formular zurücksetzen (optional)
      this.responseForm.reset();
    },
    error: (err) => {
      console.error('Fehler beim Absenden der Antworten:', err);
      this.submitError = 'Fehler beim Absenden. Bitte versuche es später erneut.';
      this.submitSuccess = false;
    }
  });
}

}






