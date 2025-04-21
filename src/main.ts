import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';





bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    ...(appConfig.providers || [])
  ]
})
  .catch((err) => console.error(err));

