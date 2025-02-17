import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,of,catchError, map, tap } from 'rxjs';
import {jwtDecode} from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'https://localhost:7090/api/auth'; 
  private userUrl = 'https://localhost:7090/api/user';
  

  constructor(private http: HttpClient) {}

 private token: string | null = null; // 🔥 Variable für das Token

login(email: string, password: string): Observable<any> {
  return this.http.post<{ token: string }>(`${this.authUrl}/login`, { email, password })
    .pipe(
      tap(response => {
        if (response.token) {
          this.token = response.token; // 🔥 Speichern in der Variable
          localStorage.setItem('token', response.token);
        }
      })
    );
}


  register(username: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, { username, email, password, role });
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): Observable<string | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("getUserRole(): Kein Token gefunden!");
      return of(null); // Kein API-Call, wenn kein Token existiert
    }
  
    return this.http.get<{ role: string }>(`${this.userUrl}/user-role`).pipe(
      map(response => response.role),
      catchError(error => {
        console.warn("getUserRole(): Fehler beim Abrufen der Rolle", error);
        return of(null);
      })
    );
  }
  
  
     

  getUserRoleSync(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    const decodedToken: any = jwtDecode(token);
    return decodedToken.role || null; // 🔹 Benutzerrolle synchron abrufen
  }  
  
  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    const decodedToken: any = jwtDecode(token);
    console.log("Decoded Token:", decodedToken); // 🔹 Token-Daten ausgeben
  
    return decodedToken.sub ? parseInt(decodedToken.sub) : null; // 🔹 User-ID auslesen
  }
  
  getUserData(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);
  
    return this.http.get<any>(`https://localhost:7090/api/user/user-role/${userId}`); 
  }
  
  
}

