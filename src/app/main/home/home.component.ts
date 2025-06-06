import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService, INews } from '../../services/news.service'; 
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  successMessage: string = '';
  fadeOut: boolean = false;
  newsList: INews[] = []; // Array für News-Objekte

  constructor(private route: ActivatedRoute, private newsService: NewsService , private router: Router, public authService: AuthService) {}

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
      next: (data) => this.newsList = data.slice(0, 3),
      error: (err) => console.error("Fehler beim Laden der News:", err)
    });
  }
}