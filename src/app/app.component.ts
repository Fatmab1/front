import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component'; // ✅ Importation de la navbar

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent], // ✅ Inclure la navbar ici
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar> <!-- ✅ Navbar affichée si nécessaire -->
    <router-outlet></router-outlet> <!-- ✅ Charge la bonne page -->
  `
})
export class AppComponent {
  showNavbar = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // ✅ Afficher la navbar sauf sur login et signup
        this.showNavbar = !['/auth/login', '/auth/signup'].includes(event.url);
      }
    });
  }
}
