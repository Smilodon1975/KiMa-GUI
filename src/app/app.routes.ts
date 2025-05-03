import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './services/admin.guard';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { PasswordResetRequestComponent } from './password-reset-request/password-reset-request.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { AdminFaqComponent } from './admin-faq/admin-faq.component';
import { AdminNewsComponent } from './admin-news/admin-news.component';
import { NewsPageComponent } from './pages/news-page/news-page.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { FeedbackComponent } from './feedback/feedback.component';

// ✅ AuthGuard für geschützte Routen
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

// ✅ Wartungs-Guard
const maintenanceGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = new URLSearchParams(window.location.search).get('token');

  if (token === 'geheim123') {
    localStorage.setItem('accessGranted', 'true');
    return true;
  }

  if (localStorage.getItem('accessGranted') === 'true') {
    return true;
  }

  router.navigate(['/maintenance']);
  return false;
};

// ✅ Definiert die Anwendungsrouten
export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [maintenanceGuard] },
  { path: 'home', component: HomeComponent, canActivate: [maintenanceGuard] },
  { path: 'info', component: InfoComponent, canActivate: [maintenanceGuard] },
  { path: 'user', component: UserComponent, canActivate: [authGuard, maintenanceGuard] },
  { path: 'login', component: LoginComponent, canActivate: [maintenanceGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard, maintenanceGuard], data: { role: 'Admin' } },
  { path: 'register', component: RegisterComponent, canActivate: [maintenanceGuard] },
  { path: 'password-reset-request', component: PasswordResetRequestComponent, canActivate: [maintenanceGuard] },
  { path: 'reset-password', component: PasswordResetComponent, canActivate: [maintenanceGuard] },
  { path: 'welcome', component: WelcomeComponent, canActivate: [maintenanceGuard] },
  { path: 'confirm-email', component: ConfirmEmailComponent, canActivate: [maintenanceGuard] },
  { path: 'admin-faq', component: AdminFaqComponent, canActivate: [AdminGuard, maintenanceGuard] },
  { path: 'admin-news', component: AdminNewsComponent, canActivate: [AdminGuard, maintenanceGuard] },
  { path: 'news', component: NewsPageComponent, canActivate: [maintenanceGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [authGuard, maintenanceGuard] },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: '**', redirectTo: '' }
];
