import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule), // ✅ Ajoute HttpClientModule ici
    provideRouter(routes), // ✅ Vérifie que les routes sont bien importées
  ],
}).catch(err => console.error(err));
