import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import {jwtDecode} from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'https://localhost:7090/api/auth'; 
  

  constructor(private http: HttpClient) {}
  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('jwt', response.token); // Token speichern
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
    const userId = this.getUserId();
    if (!userId) return of(null);
  
    const token = localStorage.getItem('token');
    if (!token) return of(null); // 🔹 Kein Token? Dann abbrechen
  
    const headers = { Authorization: `Bearer ${token}` }; // 🔹 Token im Header setzen
  
    return this.http.get<string>(`https://localhost:7090/api/user/user-role/${userId}`, { headers });
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

