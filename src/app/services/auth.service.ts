import { Injectable, inject  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap, throwError, BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface JwtPayload {exp: number; [key: string]: any;}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authUrl = `${environment.apiUrl}/auth`;
  private userUrl = `${environment.apiUrl}/user`;
  private readonly tokenKey = 'token';
  private authStatus = new BehaviorSubject<boolean>(this.hasValidToken());
  
  private userRole = new BehaviorSubject<string | null>(null);

  authStatusChanged = this.authStatus.asObservable();
  userRoleChanged = this.userRole.asObservable();

  constructor() {
    this.authStatus.next(this.hasValidToken());
    this.initUserRole();
  }
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      // exp ist Unix-Zeit in Sekunden
      return Math.floor(Date.now() / 1000) < exp;
    } catch {
      return false;
    }
  }

 checkToken(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
  }
  
  login(data: { email: string; password:string }) {
    return this.http.post<{token:string}>(`${environment.apiUrl}/auth/login`, data)
      .pipe(
        tap(res => {
          localStorage.setItem(this.tokenKey, res.token);
          this.authStatus.next(true);
          this.initUserRole();
        }),
        catchError(err => {
          this.authStatus.next(false);
          return throwError(() => err);
        })
      );
    }

 isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authStatus.next(false);
    this.userRole.next(null);
  }

  getUserRole(): Observable<string | null> {
    return this.userRoleChanged;
  }

  getUserRoleSync(): string | null {
    return this.userRole.value;
  }

  private initUserRole(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      this.userRole.next(null);
      return;
    }
    try {
      const decoded = jwtDecode<any>(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? null;
      this.userRole.next(role);
    } catch {
      this.userRole.next(null);
    }
  }

  // ✅ Führt Registrierung durch
  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, registerData).pipe(
      catchError(error => {
        console.error("Registrierung fehlgeschlagen:", error);  
        let errorMessage = "Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben.";  
        if (error.error) {
          // Wenn das Fehlerobjekt eine "errors"-Eigenschaft hat
          if (error.error.errors) {
            const errorsObj = error.error.errors;
            let errorMessages: string[] = [];
            // Iteriere über alle Schlüssel im errors-Objekt
            for (const key in errorsObj) {
              if (errorsObj.hasOwnProperty(key)) {
                const messages = errorsObj[key];
                if (Array.isArray(messages)) {
                  errorMessages.push(...messages);
                } else {
                  errorMessages.push(messages.toString());}}}
            errorMessage = errorMessages.join(" ");
          } else if (typeof error.error === "string") {
            // Falls error.error direkt ein String ist
            errorMessage = error.error;
          } else {errorMessage = JSON.stringify(error.error);}}
        return throwError(() => errorMessage);}));
      }  


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
  // getUserData(): Observable<any> {
  //   const userId = this.getUserId();
  //   if (!userId) return of(null);
  
  //   return this.http.get<any>(`${this.userUrl}/user-role/${userId}`); 
  // }
  getUserData(): Observable<{ email: string; userName: string; /* ... */ } | null> {
  const userId = this.getUserId();
  if (!userId) return of(null);
  return this.http
    .get<any>(`${this.userUrl}/${userId}`)   // ← richtige URL: /api/user/{id}
    .pipe(
      catchError(err => {
        // statt Error ins Console: einfach null zurückliefern
        console.warn('getUserData fehlgeschlagen, ignoriere:', err.status);
        return of(null);
      })
    );
}

  // ✅ Passwort-Reset anfordern
  requestPasswordReset(email: string) {
    return this.http.post(`${this.authUrl}/request-password-reset`, { email });
  }

  // ✅ Neues Passwort setzen
  resetPassword(data: { email: string; token: string; newPassword: string; userName: string }) {
    console.log("🚀 Sende Reset-Passwort-Anfrage mit:", data);
    return this.http.post(`${this.authUrl}/reset-password`, data);
  }
  

 

  confirmEmail(email: string, token: string): Observable<any> {
    const url = `${this.authUrl}/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    return this.http.get(url, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error("E-Mail-Bestätigung fehlgeschlagen:", error);
        return throwError(() => error);
      })
    );
  } 


}
