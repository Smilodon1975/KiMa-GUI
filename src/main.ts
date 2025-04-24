import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';


if (environment.production) {
  console.log('🚀 Produktionsmodus aktiviert');
} else {
  console.log('🧪 Entwicklungsmodus aktiv');
}


bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    ...(appConfig.providers || [])
  ]
})
  .catch((err) => console.error(err));

