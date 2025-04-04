import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService, INews } from '../services/news.service'; 
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  successMessage: string = '';
  fadeOut: boolean = false;
  newsList: INews[] = []; // Hier werden die News gespeichert

  constructor(private route: ActivatedRoute, private newsService: NewsService , private router: Router) {}

  ngOnInit(): void {
    // Prüfe Query-Parameter (z. B. Logout-Meldung)
    this.route.queryParams.subscribe(params => {
      if (params['logout'] === 'true') {
        this.successMessage = 'Du hast dich erfolgreich abgemeldet';
        setTimeout(() => { this.fadeOut = true; }, 2000);
        setTimeout(() => {
          this.successMessage = '';
          this.fadeOut = false;
        }, 3000);
      }
    });

    // News laden
    this.newsService.getNews().subscribe({
      next: (data) => this.newsList = data,
      error: (err) => console.error("Fehler beim Laden der News:", err)
    });
  }
}
