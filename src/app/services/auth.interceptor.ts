import { HttpInterceptorFn } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // ✅ Token aus dem Local Storage abrufen (falls nicht vorhanden, leerer String)
    const token = localStorage.getItem('token') || "";

    // ✅ Falls ein Token vorhanden ist, füge es als Authorization-Header hinzu
    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next(cloned).pipe(
      catchError(error => {
        // ❌ Falls die Anfrage mit 401 (Unauthorized) fehlschlägt, Token löschen
        if (error.status === 401) {
          console.warn("Interceptor: Unauthorized - Möglicherweise Token abgelaufen!");
          localStorage.removeItem('token');
        }
        return throwError(() => error);
      })
    );
};
