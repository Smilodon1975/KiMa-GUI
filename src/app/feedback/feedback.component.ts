import { Component, OnInit  } from '@angular/core';
import { FeedbackService } from '../services/feedback.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  content = '';
  message = '';
  userId: number | null = null;
  email:  string | null = null;

  constructor(
    private fb:   FeedbackService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // ID direkt holen:
    this.userId = this.auth.getUserId();                                    // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

    // E-Mail aus dem User-API laden (falls nötig):
    if (this.auth.isLoggedIn()) {
      this.auth.getUserData().subscribe(u => {
        this.email = u?.email ?? null;
      });
    }
  }

  send() {
    const dto = {
      content: this.content,
      userId:  this.userId ?? undefined,
      email:   this.email  ?? undefined
    };
    this.fb.submit(dto).subscribe({
      next: () => {
        this.message = 'Danke für dein Feedback!';
        this.content = '';
      },
      error: () => this.message = 'Fehler beim Senden.'
    });
  }
}
