import 'bootstrap/dist/css/bootstrap.min.css';
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { DragDropModule } from '@angular/cdk/drag-drop';


if (environment.production) {
  console.log('🚀 Produktionsmodus aktiviert');
} else {
  console.log('🧪 Entwicklungsmodus aktiv');
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    ),

    ...(appConfig.providers || [])
  ]
})
  .catch((err) => console.error(err));

