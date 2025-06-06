import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-feedback.component.html',
  styleUrls: ['./admin-feedback.component.css']
})
export class AdminFeedbackComponent implements OnInit {
  feedbacks: Feedback[] = [];

  constructor(private fb: FeedbackService, private router: Router) {}
  ngOnInit() { this.load(); }

  load() {
    this.fb.getAll().subscribe(list => (this.feedbacks = list));
  }

  del(id: number) {
    if (!confirm('Wirklich löschen?')) return;
    this.fb.delete(id).subscribe(() => this.load());
  }

    
}

