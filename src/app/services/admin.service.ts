import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminUrl = 'https://localhost:7090/api/admin';

  constructor(private http: HttpClient) {}

  // 🔹 Alle User abrufen
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/users`);
  }
}  
