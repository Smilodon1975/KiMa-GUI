
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { QuestionDef } from '../../models/question-def.model';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-response',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-response.component.html',
  styleUrls: ['./project-response.component.css']
})
export class ProjectResponseComponent implements OnInit {
  projectId!: number;
  project?: Project;
  questions: QuestionDef[] = [];

 
  responseForm!: FormGroup;

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
          return this.fb.control('', Validators.required);
        case 'date':
          return this.fb.control('', Validators.required);
        case 'checkbox':
          const arr = q.options?.map(() => this.fb.control(false)) ?? [];
          return this.fb.array(arr);
        case 'radio':
          return this.fb.control('', Validators.required);
        case 'select':
          return this.fb.control('', Validators.required);
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
    if (this.responseForm.invalid) {
      return;
    }

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
          const selectedLabels = q.options
            ?.filter((opt, optIdx) => controlValue[optIdx])
            .map((opt) => opt.value) ?? [];
          return { questionId: q.id, answer: selectedLabels.join(',') };
        default:
          return { questionId: q.id, answer: controlValue };
      }
    });
    const payload = {
      projectId: this.projectId,
      answersJson: JSON.stringify(answerPayload)
    };

    this.projectSvc.submitResponse(payload).subscribe({
      next: () => {
        alert('Vielen Dank – deine Antworten wurden gespeichert!');
        this.router.navigate(['/']);},
      error: (err) => {
        console.error('Fehler beim Absenden der Antworten:', err);
        alert('Es gab einen Fehler beim Absenden. Versuche es bitte noch einmal.');
      }
    });
  }



}

