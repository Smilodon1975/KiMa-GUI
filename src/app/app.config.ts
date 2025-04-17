import { provideRouter } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ✅ Konfiguration der Anwendung
// Hier werden die Module und Routen für die Anwendung bereitgestellt

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(CommonModule, FormsModule, RouterModule), // ✅ Importiert CommonModule & FormsModule
    provideRouter(routes),   // ✅ Registriert die Routen
    provideHttpClient(withInterceptors([authInterceptor])) // ✅ Setzt den Auth-Interceptor für HTTP-Anfragen
  ]
};
