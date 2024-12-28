import { Routes } from '@angular/router';
import { ProbandenComponent } from './probanden/probanden.component';
import { KundenComponent } from './kunden/kunden.component';


export const routes: Routes = [
    { path: 'probanden', component: ProbandenComponent },
    { path: 'kunden', component: KundenComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
  ];