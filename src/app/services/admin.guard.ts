import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getUserRole(1).pipe(
      map(role => {
        if (role === 'Admin') {
          return true;
        } else {
          alert("Kein Zugriff!");
          this.router.navigate(['/home']);
          return false;
        }
      })
    );
  }
}

