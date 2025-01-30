import { Routes } from '@angular/router';
import { ProbandenComponent } from './probanden/probanden.component';
import { KundenComponent } from './kunden/kunden.component';
import { HomeComponent } from './home/home.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },  // Startseite
  { path: 'home', component: HomeComponent },  // Home-Route für redirectTo
  { path: 'probanden', component: ProbandenComponent },
  { path: 'kunden', component: KundenComponent },
  ];