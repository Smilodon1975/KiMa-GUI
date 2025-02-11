import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './home/home.component';
import { ProbandenComponent } from './probanden/probanden.component';
import { KundenComponent } from './kunden/kunden.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './services/admin.guard';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'probanden', component: ProbandenComponent, canActivate: [authGuard] },
  { path: 'kunden', component: KundenComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard], data: { role: 'Admin' } },
];
