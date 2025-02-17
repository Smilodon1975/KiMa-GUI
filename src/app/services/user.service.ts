import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7090/api/user'; // Passe den Port an!

  constructor(private http: HttpClient) {}

  // 🔹 Admin: Alle Probanden abrufen
  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  // 🔹 Proband: Eigene Daten abrufen
  getMyData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }
}
