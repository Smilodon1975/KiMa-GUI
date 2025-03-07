import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { UserUpdateModel } from '../models/user-update.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userUrl = 'https://localhost:7090/api/user'; // ✅ API-Endpunkt für Benutzer

  constructor(private http: HttpClient) {}

  // ✅ Ruft die eigenen Benutzerdaten ab
  getMyData(): Observable<any> {
    return this.http.get<any>(`${this.userUrl}/me`).pipe(
      catchError(() => of(null)) // ❌ Fehler abfangen und `null` zurückgeben
    );
  }

  // ✅ Aktualisiert die Benutzerdaten
  updateUserData(userData: UserUpdateModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem("authToken")}` // ✅ Token wird mitgeschickt
    });
    return this.http.put(`${this.userUrl}/update`, userData, { headers });
  }
}
