import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token') || ""; // 🔥 Falls null, leeren String setzen
    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(cloned).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.warn("Interceptor: Unauthorized - Möglicherweise Token abgelaufen!");
          localStorage.removeItem('token'); // Token löschen, wenn ungültig
        }
        return throwError(() => error);
      })
    );
  };
  

