import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Feedback, FeedbackDto } from '../models/feedback.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private api = '/api/feedback';
  constructor(private http: HttpClient) {}

  submit(dto: FeedbackDto): Observable<any> {
    return this.http.post(this.api, dto);
  }

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.api);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
