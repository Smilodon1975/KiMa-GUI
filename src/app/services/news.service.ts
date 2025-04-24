import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  
  private newsUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) { }

  getNews(): Observable<INews[]> {
    return this.http.get<INews[]>(this.newsUrl);
  }

  createNews(news: INews): Observable<INews> {
    return this.http.post<INews>(this.newsUrl, news);
  }

  updateNews(news: INews): Observable<any> {
    if (!news.id) {
      throw new Error('News ID is undefined');
    }
    return this.http.put(`${this.newsUrl}/${news.id}`, news);
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.newsUrl}/${id}`);
  }
}
