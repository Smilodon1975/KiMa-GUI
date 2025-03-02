import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { UserUpdateModel } from '../models/user-update.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userUrl = 'https://localhost:7090/api/user'; // Passe den Port an!

  constructor(private http: HttpClient) {}

  // 🔹 Proband: Eigene Daten abrufen
  getMyData(): Observable<any> {
    return this.http.get<any>(`${this.userUrl}/me`).pipe(
      catchError(() => of(null))
    );
  }

   // 🔹 Benutzerdaten speichern
   updateUserData(userData: UserUpdateModel): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem("authToken")}` // ✅ Token wird mitgeschickt
    });
    return this.http.put(`${this.userUrl}/update`, userData, { headers });
  }
  
  
}
