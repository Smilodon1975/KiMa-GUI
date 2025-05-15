import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, throwError } from 'rxjs';
import { UserUpdateModel } from '../models/user-update.model';
import { UserProfile } from '../models/user-profile.model';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment'; // ✅ Importiere die Umgebungsvariablen

@Injectable({providedIn: 'root'})
export class UserService {
  private userUrl: string = `${environment.apiUrl}/user`; 
  private profileUrl: string = `${environment.apiUrl}/userprofile`; 

  constructor(private http: HttpClient) {}

  // ✅ Ruft die eigenen Benutzerdaten ab
  getMyData(): Observable<any> {
    return this.http.get<any>(`${this.userUrl}/me`).pipe(
      catchError(() => of(null)) // ❌ Fehler abfangen und `null` zurückgeben
    );
  }

  // Aktualisiert die *Basis*-Benutzerdaten (ohne Profil!)
  // Nimmt jetzt nur noch die relevanten Felder entgegen
  updateUserData(userData: Omit<User, 'id' | 'profile' | 'createdAt' | 'role' | 'status' | 'age'> & { password?: string }): Observable<any> {
    return this.http.put(`${this.userUrl}/update`, userData); // Schickt nur User-Daten
  }

  // Aktualisiert die UserProfile-Daten
  updateUserProfileData(profileData: UserProfile): Observable<any> {
      // Headers werden hier wahrscheinlich auch benötigt, wenn der Endpunkt geschützt ist
     const headers = new HttpHeaders({
       'Authorization': `Bearer ${localStorage.getItem("authToken")}`
     });
     // Sendet die Profildaten an den PUT /api/userprofile Endpunkt
    return this.http.put(this.profileUrl, profileData, { headers });
  }

  deleteAccount(password: string): Observable<any> {
    return this.http.post(`${this.userUrl}/delete-account`, { password })
      .pipe(
        catchError(error => {
          console.error("Fehler beim Löschen des Accounts:", error);
          return throwError(() => error);
        })
      );
  } 

}
