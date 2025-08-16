import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { NewsService } from '../../services/news.service';
import { INews } from '../../services/news.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ModalMoveResizeDirective } from '../../shared/modal-move-resize.directive';

@Component({
  selector: 'app-admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalMoveResizeDirective],
})
export class AdminNewsComponent implements OnInit {
  newsList: INews[] = [];
  selectedNews: INews | null = null;
  // Standardwerte: Passe Felder an dein Modell an (z. B. PublishDate als Date)
  newsData: INews = { id: 0, title: '', content: '', publishDate: new Date() };

  constructor(private newsService: NewsService, private router: Router) {}


  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsService.getNews().subscribe({
      next: (data) => (this.newsList = data),
      error: (err) => console.error("Fehler beim Laden der News:", err),
    });
  }

  openEditModal(): void {
    // Neues News-Objekt oder Reset des Formulars
    this.selectedNews = null;
    this.newsData = { id: 0, title: '', content: '', publishDate: new Date() };
    const modalElement = document.getElementById('newsModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  editNews(news: INews): void {
    this.selectedNews = news;
    // Kopiere die News-Daten in newsData für die Bearbeitung
    this.newsData = { ...news };
    const modalElement = document.getElementById('newsModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  saveNews(): void {
    if (this.selectedNews) {
      // Update
      this.newsService.updateNews(this.newsData).subscribe({
        next: () => {
          this.loadNews();
          this.closeModal();
        },
        error: (err) => console.error("Fehler beim Aktualisieren der News:", err),
      });
    } else {
      // Create
      this.newsService.createNews(this.newsData).subscribe({
        next: () => {
          this.loadNews();
          this.closeModal();
        },
        error: (err) => console.error("Fehler beim Erstellen der News:", err),
      });
    }
  }

  deleteNews(id: number): void {
    if (confirm("Möchtest du diese News wirklich löschen?")) {
      this.newsService.deleteNews(id).subscribe({
        next: () => this.loadNews(),
        error: (err) => console.error("Fehler beim Löschen der News:", err),
      });
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('newsModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }
}

