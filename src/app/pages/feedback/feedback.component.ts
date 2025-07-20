import { Component, OnInit  } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
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
  sending = false;
  fadeMessage = false;

  constructor(
    private fb:   FeedbackService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // ID direkt holen:
    this.userId = this.auth.getUserId();  
    if (this.auth.isLoggedIn()) {
      this.auth.getUserData().subscribe(u => {
        this.email = u?.email ?? null;
      });
    }
  }

  send() {
    if (!this.content) return;
    this.sending = true;
    this.message = '';
    this.fadeMessage = false;
    this.fb.submit({ content: this.content, userId: this.userId ?? undefined, email: this.email ?? undefined }).subscribe({
      next: () => {
        this.message = 'Feedback erfolgreich gesendet!';
        this.content = '';
        this.sending = false;
        setTimeout(() => this.fadeMessage = true, 3000); // nach 3s starten
        setTimeout(() => this.message = '', 4000); // nach 4s entfernen
      },
      error: () => {
        this.message = 'Fehler beim Senden des Feedbacks.';
        this.sending = false;
      }
    });
  }

}
