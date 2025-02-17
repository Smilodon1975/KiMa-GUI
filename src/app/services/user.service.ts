import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7090/api/user'; // Passe den Port an!

  constructor(private http: HttpClient) {}

  // 🔹 Proband: Eigene Daten abrufen
  getMyData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      catchError(() => of(null))
    );
  }
  
}
