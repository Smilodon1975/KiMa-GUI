import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injector-Helpers
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1️⃣ Token-Lebenszeit prüfen und ggf. automatisch ausloggen
  auth.checkToken();  

  // 2️⃣ Token aus dem Local Storage abrufen
  const token = localStorage.getItem('token') || "";

  // 3️⃣ Request klonen und Authorization-Header anhängen (falls Token vorhanden)
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // 4️⃣ Anfrage weiterschicken und auf 401 reagieren
  return next(cloned).pipe(
    catchError(error => {
      if (error.status === 401) {
        console.warn("Interceptor: Unauthorized – Token abgelaufen oder ungültig, Logging out.");
        auth.logout();         // leert LocalStorage und navigiert zum /login
      }
      return throwError(() => error);
    })
  );
};
