import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service.service'; // ✅ Import du service d'authentification
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  identifier: string = ''; // 🔹 Utilisateur peut entrer un email ou un nom d'utilisateur
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('📩 Tentative de connexion:', { identifier: this.identifier });

    this.authService.login(this.identifier, this.password).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie ! Token reçu:', response.access_token);

        // 🔥 Stocker le token et récupérer le rôle
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('role', response.role); // ✅ Stocke le rôle de l'utilisateur

        // 🔄 Redirection en fonction du rôle
        if (response.role === 'admin') {
          this.router.navigate(['/auth/signup']); // ✅ Redirige vers l'interface Admin
        } else {
          this.router.navigate(['/dashboard']); // ✅ Redirige vers l'interface normale
        }
      },
      error: (err) => {
        console.log('❌ Erreur de connexion:', err);
        this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      }
    });
  }
}
