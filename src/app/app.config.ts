import { provideRouter } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(CommonModule, FormsModule), // 🔹 Beide Module importieren!
    provideRouter(routes),   
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
