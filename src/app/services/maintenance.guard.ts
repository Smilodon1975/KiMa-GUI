
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';


@Injectable({ providedIn: 'root' })
export class MaintenanceGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = new URLSearchParams(window.location.search).get('token');

    if (token === 'geheim123') {
      localStorage.setItem('accessGranted', 'true');
      return true;
    }

    if (localStorage.getItem('accessGranted') === 'true') {
      return true;
    }

    this.router.navigate(['/maintenance']);
    return false;
  }
}
