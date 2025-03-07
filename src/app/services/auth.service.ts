import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap, throwError, BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'https://localhost:7090/api/auth'; 
  private userUrl = 'https://localhost:7090/api/user';

  private authStatus = new BehaviorSubject<boolean>(this.isTokenValid()); // ✅ Speichert den Auth-Status
  private userRole = new BehaviorSubject<string | null>(null); // ✅ Speichert die Benutzerrolle  

  authStatusChanged = this.authStatus.asObservable(); // ✅ Beobachtbarer Login-Status
  userRoleChanged = this.userRole.asObservable(); // ✅ Beobachtbare Benutzerrolle

  constructor(private http: HttpClient) {
    this.initUserRole(); // ✅ Versucht Benutzerrolle aus Token zu setzen
  }

  // ✅ Prüft, ob ein Token existiert
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ Führt Login durch und speichert Token
  login(loginData: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.authStatus.next(true); // ✅ Login-Status aktualisieren
          this.initUserRole(); // ✅ Benutzerrolle setzen
        }
      })
    );
  }

  // ✅ Führt Registrierung durch
  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, registerData).pipe(
      catchError(error => {
        console.error("Registrierung fehlgeschlagen:", error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Führt Logout durch
  logout(): void {
    localStorage.removeItem('token');
    this.authStatus.next(false); // ✅ Auth-Status zurücksetzen
    this.userRole.next(null); // ✅ Benutzerrolle zurücksetzen
  }

  // ✅ Prüft, ob der Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    return this.authStatus.value;
  }

  // ✅ Gibt die Benutzerrolle als Observable zurück
  getUserRole(): Observable<string | null> {
    return this.userRoleChanged;
  }

  // ✅ Gibt die Benutzerrolle synchron zurück
  getUserRoleSync(): string | null {
    return this.userRole.value;
  }

  // ✅ Setzt die Benutzerrolle anhand des Tokens
  private initUserRole(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token Inhalt:", decodedToken);
        
        // ✅ Extrahiere die Rolle aus dem Token
        const roleClaimKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
        const userRole = decodedToken[roleClaimKey] || null;
        
        console.log("Ermittelte Rolle aus Token:", userRole);
        this.userRole.next(userRole);
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

  // ✅ Holt Benutzerdaten anhand der Benutzer-ID
  getUserData(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);
  
    return this.http.get<any>(`${this.userUrl}/user-role/${userId}`); 
  }

  // ✅ Passwort-Reset anfordern
  requestPasswordReset(email: string) {
    return this.http.post(`${this.authUrl}/forgot-password`, { email });
  }

  // ✅ Neues Passwort setzen
  resetPassword(data: { email: string; token: string; newPassword: string }) {
    return this.http.post(`${this.authUrl}/auth/reset-password`, data);
  }

  // ✅ Prüft, ob das gespeicherte Token gültig ist
  private isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      return !!decodedToken;
    } catch (error) {
      return false;
    }
  }
}
