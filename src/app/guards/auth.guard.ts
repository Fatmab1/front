import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true; // ✅ Accès autorisé si l'utilisateur est connecté
    } else {
      this.router.navigate(['/auth/login']); // 🔄 Redirige vers `/auth/login` si l'utilisateur n'est pas connecté
      return false;
    }
  }
}
