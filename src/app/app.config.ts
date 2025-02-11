import { provideRouter } from '@angular/router';
import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), provideHttpClient()
  ]
};