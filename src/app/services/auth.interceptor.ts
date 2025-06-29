import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injector-Helpers
  const auth = inject(AuthService);
  const router = inject(Router);


  auth.checkToken();  
  const token = localStorage.getItem('token') || "";
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  
  return next(cloned).pipe(
    catchError(error => {
      if (error.status === 401) {
        console.warn("Interceptor: Unauthorized – Token abgelaufen oder ungültig, Logging out.");
        auth.logout(); 
      }
      return throwError(() => error);
    })
  );
};
