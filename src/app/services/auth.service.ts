import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,of,catchError, map, tap, throwError, BehaviorSubject } from 'rxjs';
import {jwtDecode} from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'https://localhost:7090/api/auth'; 
  private userUrl = 'https://localhost:7090/api/user';

  private authStatus = new BehaviorSubject<boolean>(this.isTokenValid()); // 🔹 Startwert: Ist ein Token da?
  private userRole = new BehaviorSubject<string | null>(null); // 🔹 Benutzerrolle speichern  

  authStatusChanged = this.authStatus.asObservable(); // Zum Abonnieren in anderen Komponenten
  userRoleChanged = this.userRole.asObservable(); // Zum Abonnieren in anderen Komponenten

  

  constructor(private http: HttpClient) {
    this.initUserRole(); // 🔥 Versucht Rolle aus Token zu setzen
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(loginData: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.authStatus.next(true); // 🔥 Login-Status aktualisieren
          this.initUserRole(); // 🔥 Rolle setzen
        }
      })
    );
  }

register(registerData: any): Observable<any> {
  return this.http.post<any>(`${this.authUrl}/register`, registerData).pipe(
    catchError(error => {
      console.error("Registrierung fehlgeschlagen:", error);
      return throwError(() => error);
    })
  );
}

logout(): void {
  localStorage.removeItem('token');
  this.authStatus.next(false); // 🔥 Logout-Status setzen
  this.userRole.next(null); // 🔥 Benutzerrolle zurücksetzen
}

isLoggedIn(): boolean {
  return this.authStatus.value; // 🔥 Login-Status synchron abrufen
}

getUserRole(): Observable<string | null> {
  return this.userRoleChanged; // 🔥 Immer aktuelle Benutzerrolle zurückgeben
}

  // ✅ Benutzerrolle synchron abrufen (direkt nutzbar)
  getUserRoleSync(): string | null {
    return this.userRole.value;
  }

  private initUserRole(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token Inhalt:", decodedToken); // 🐞 Debug-Log
        
        // 🔹 Extrahiere die Rolle aus dem Token
        const roleClaimKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
        const userRole = decodedToken[roleClaimKey] || null;
        
        console.log("Ermittelte Rolle aus Token:", userRole);
        this.userRole.next(userRole); // 🔥 Setze die Benutzerrolle
      } catch (error) {
        console.error("Fehler beim Decodieren des Tokens:", error);
        this.userRole.next(null);
      }
    } else {
      console.warn("Kein Token gefunden beim Setzen der Benutzerrolle!");
      this.userRole.next(null);
    }
}


  // ✅ Benutzer-ID aus Token abrufen
  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.sub ? parseInt(decodedToken.sub) : null;
    } catch (error) {
      console.error("Fehler beim Decodieren des Tokens:", error);
      return null;
    }
  }
  
  getUserData(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);
  
    return this.http.get<any>(`https://localhost:7090/api/user/user-role/${userId}`); 
  }
  
 // 🔹 Passwort-Reset anfordern
 requestPasswordReset(email: string) {
  return this.http.post(`${this.authUrl}/forgot-password`, { email });
}

// 🔹 Neues Passwort setzen
resetPassword(data: { email: string; token: string; newPassword: string }) {
  return this.http.post(`${this.authUrl}/auth/reset-password`, data);
}

// ✅ Prüft, ob das Token gültig ist
private isTokenValid(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decodedToken: any = jwtDecode(token);
    return !!decodedToken; // Prüft, ob das Token gültig ist
  } catch (error) {
    return false;
  }
}

}

  


