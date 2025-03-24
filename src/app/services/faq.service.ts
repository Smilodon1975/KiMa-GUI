import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private faqUrl = 'https://localhost:7090/api/faq';

  constructor(private http: HttpClient) { }

  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.faqUrl);
  }

  createFAQ(faq: FAQ): Observable<FAQ> {
    return this.http.post<FAQ>(this.faqUrl, faq);
  }

  updateFAQ(faq: FAQ): Observable<any> {
    return this.http.put(`${this.faqUrl}/${faq.id}`, faq);
  }

  deleteFAQ(id: number): Observable<any> {
    return this.http.delete(`${this.faqUrl}/${id}`);
  }
}
