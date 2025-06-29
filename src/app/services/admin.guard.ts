import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

 
  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('token');
   
    if (!token) {
      console.log("AdminGuard: Kein Token gefunden!");
      this.router.navigate(['/home']);
      return of(false);
    }
  
    return this.authService.getUserRole().pipe(
      map(role => {
        console.log("AdminGuard prüft Rolle:", role);
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
