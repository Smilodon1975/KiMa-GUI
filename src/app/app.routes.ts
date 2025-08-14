import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './main/home/home.component';
import { ImpressumComponent } from './main/impressum/impressum.component';
import { DatenschutzComponent } from './main/datenschutz/datenschutz.component';
import { InfoComponent } from './pages/info/info.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './services/admin.guard';
import { UserComponent } from './pages/user/user.component';
import { RegisterComponent } from './pages/register/register.component';
import { PasswordResetRequestComponent } from './pages/password-reset-request/password-reset-request.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ConfirmEmailComponent } from './pages/confirm-email/confirm-email.component';
import { AdminFaqComponent } from './admin/admin-faq/admin-faq.component';
import { AdminNewsComponent } from './admin/admin-news/admin-news.component';
import { NewsPageComponent } from './pages/news-page/news-page.component';
import { AutomotiveProjectComponent } from './pages/automotive-project/automotive-project.component';
import { B2BProjectComponent } from './pages/b2b-project/b2b-project.component';
import { ConsumerProjectComponent } from './pages/consumer-project/consumer-project.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { AdminFeedbackComponent } from './admin/admin-feedback/admin-feedback.component'; 
import { AdminCampaignComponent } from './admin/admin-campaign/admin-campaign.component';
import { AdminProjectsComponent } from './admin/admin-projects/admin-projects.component';
import { ProjectResponseComponent } from './pages/project-response/project-response.component';
import { ProjectViewComponent } from './pages/project-view/project-view.component';


// ✅ AuthGuard für geschützte Routen
const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/home']);
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

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [] },
  { path: 'home', component: HomeComponent, canActivate: [] },
  { path: 'info', component: InfoComponent, canActivate: [] },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'datenschutz', component: DatenschutzComponent },
  { path: 'user', component: UserComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [] },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard], data: { role: 'Admin' } },
  { path: 'register', component: RegisterComponent, canActivate: [] },
  { path: 'password-reset-request', component: PasswordResetRequestComponent, canActivate: [] },
  { path: 'reset-password', component: PasswordResetComponent, canActivate: [] },
  { path: 'welcome', component: WelcomeComponent, canActivate: [] },
  { path: 'confirm-email', component: ConfirmEmailComponent, canActivate: [] },
  { path: 'admin-faq', component: AdminFaqComponent, canActivate: [AdminGuard] },
  { path: 'admin-news', component: AdminNewsComponent, canActivate: [AdminGuard] },
  { path: 'news', component: NewsPageComponent, canActivate: [] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [authGuard] },
  { path: 'admin-feedback', component: AdminFeedbackComponent, canActivate: [AdminGuard] },
  { path: 'admin-campaign', component: AdminCampaignComponent, canActivate: [AdminGuard] },
  { path: 'admin-projects', component: AdminProjectsComponent, canActivate: [AdminGuard] },
  { path: 'projects', component: ProjectViewComponent, canActivate: [] },
  { path: 'projects/:id', component: ProjectResponseComponent },
  { path: 'automotive', component: AutomotiveProjectComponent},
  { path: 'b2b', component: B2BProjectComponent},
  { path: 'consumer', component: ConsumerProjectComponent},
  { path: 'maintenance', component: MaintenanceComponent },
  { path: '**', redirectTo: '' }
];
