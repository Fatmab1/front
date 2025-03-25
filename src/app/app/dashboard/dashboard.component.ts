import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports:[ButtonModule]
})
export class DashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  // 🔹 Déconnexion de l'utilisateur
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']); // 🔄 Redirige vers la page de connexion
  }
}
