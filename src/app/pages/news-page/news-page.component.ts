import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, INews } from '../../services/news.service'; 
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css']
})
export class NewsPageComponent implements OnInit {
  allNewsList: INews[] = []; 
  isLoading = true; 
  errorMessage = ''; 

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadAllNews();
  }

  loadAllNews(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.newsService.getNews().subscribe({
      next: (data) => {
        this.allNewsList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Fehler beim Laden aller News:", err);
        this.errorMessage = "News konnten nicht geladen werden.";
        this.isLoading = false;
      }
    });
  }
}