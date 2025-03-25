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

// ✅ Definiert die Anwendungsrouten
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'info', component: InfoComponent }, // 🔹 Info bleibt für alle zugänglich
  { path: 'user', component: UserComponent, canActivate: [authGuard] }, // 🔹 Geschützt durch AuthGuard
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard], data: { role: 'Admin' } }, // 🔹 Geschützt durch AdminGuard
  { path: 'register', component: RegisterComponent },  
  { path: 'password-reset-request', component: PasswordResetRequestComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'admin-faq', component: AdminFaqComponent },

];
