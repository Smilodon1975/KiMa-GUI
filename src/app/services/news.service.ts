import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface INews {
  id: number;
  title: string;
  content: string;
  publishDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  
  private newsUrl = 'https://localhost:7090/api/news';

  constructor(private http: HttpClient) { }

  getNews(): Observable<INews[]> {
    return this.http.get<INews[]>(this.newsUrl);
  }

  createNews(news: INews): Observable<INews> {
    return this.http.post<INews>(this.newsUrl, news);
  }

  updateNews(news: INews): Observable<any> {
    return this.http.put(`${this.newsUrl}/${news.id}`, news);
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.newsUrl}/${id}`);
  }
}
