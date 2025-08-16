// admin-faq.component.ts
import { Component, OnInit } from '@angular/core';
import { FAQService, FAQ } from '../../services/faq.service';
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ModalMoveResizeDirective } from '../../shared/modal-move-resize.directive';

@Component({
  selector: 'app-admin-faq',
  templateUrl: './admin-faq.component.html',
  styleUrls: ['./admin-faq.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule, RouterModule, ModalMoveResizeDirective],
})
export class AdminFaqComponent implements OnInit {
  faqs: FAQ[] = [];
  selectedFAQ: FAQ | null = null;
  faqData: FAQ = { id: 0, question: '', answer: '', order: 0 };

  constructor(private faqService: FAQService, private router: Router) {}

  ngOnInit(): void {
    this.loadFAQs();
  }

  loadFAQs(): void {
    this.faqService.getFAQs().subscribe({
      next: (data) => this.faqs = data,
      error: (err) => console.error("Fehler beim Laden der FAQs:", err)
    });
  }

  openEditModal(): void {
    // Für neues FAQ oder Bearbeiten
    this.selectedFAQ = null;
    this.faqData = { id: 0, question: '', answer: '', order: 0 };
    const modalElement = document.getElementById('faqModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  editFAQ(faq: FAQ): void {
    this.selectedFAQ = faq;
    // Kopiere FAQ-Daten, um das Formular zu füllen
    this.faqData = { ...faq };
    const modalElement = document.getElementById('faqModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  saveFAQ(): void {
    if (this.selectedFAQ) {
      // Update
      this.faqService.updateFAQ(this.faqData).subscribe({
        next: () => {
          this.loadFAQs();
          this.closeModal();
        },
        error: (err) => console.error("Fehler beim Aktualisieren des FAQ:", err)
      });
    } else {
      // Create
      this.faqService.createFAQ(this.faqData).subscribe({
        next: () => {
          this.loadFAQs();
          this.closeModal();
        },
        error: (err) => console.error("Fehler beim Erstellen des FAQ:", err)
      });
    }
  }

  deleteFAQ(id: number): void {
    if (confirm("Möchtest du dieses FAQ wirklich löschen?")) {
      this.faqService.deleteFAQ(id).subscribe({
        next: () => this.loadFAQs(),
        error: (err) => console.error("Fehler beim Löschen des FAQ:", err)
      });
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('faqModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }
}
