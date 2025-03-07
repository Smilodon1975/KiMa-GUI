import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // ✅ Prüft, ob der Benutzer Admin ist und die Route aufrufen darf
  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('token');

    // ❌ Falls kein Token vorhanden, Weiterleitung zur Startseite
    if (!token) {
      console.log("AdminGuard: Kein Token gefunden!");
      this.router.navigate(['/home']);
      return of(false);
    }
  
    return this.authService.getUserRole().pipe(
      map(role => {
        console.log("AdminGuard prüft Rolle:", role);

        // ✅ Erlaubt den Zugriff, wenn der Benutzer Admin ist
        if (role === 'Admin') {
          return true;
        } else {
          this.router.navigate(['/home']); 
          return false;
        }
      })
    );
  }
}
