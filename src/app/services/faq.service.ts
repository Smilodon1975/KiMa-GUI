import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class FAQService {
  private faqUrl = `${environment.apiUrl}/faq`;

  constructor(private http: HttpClient) { }

  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.faqUrl);
  }

  createFAQ(faq: FAQ): Observable<FAQ> {
    return this.http.post<FAQ>(this.faqUrl, faq);
  }

  updateFAQ(faq: FAQ): Observable<any> {
    if (faq.id === undefined || faq.id === null) {
      throw new Error('FAQ ID is required for update.');
    }
    return this.http.put(`${this.faqUrl}/${faq.id}`, faq);
  }

  deleteFAQ(id: number): Observable<any> {
    return this.http.delete(`${this.faqUrl}/${id}`);
  }
}
