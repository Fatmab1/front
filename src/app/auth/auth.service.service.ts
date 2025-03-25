import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private usersUrl = 'http://localhost:3000/users';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  // 🔹 S'inscrire
  register(email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, role }).pipe(
      tap(response => console.log('✅ Inscription réussie', response)),
      catchError(err => {
        console.error('❌ Erreur lors de l\'inscription', err);
        return throwError(() => new Error(err.error.message || 'Erreur d\'inscription'));
      })
    );
  }

  // 🔹 Se connecter
  login(email: string, password: string): Observable<any> {
    return this.http.post<{ access_token: string; role: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('✅ Connexion réussie ! Token reçu:', response.access_token);
        this.saveToken(response.access_token);
      }),
      catchError(err => {
        console.error('❌ Erreur lors de la connexion', err);
        return throwError(() => new Error(err.error.message || 'Erreur de connexion'));
      })
    );
  }

  // 🔹 Stocker le token
  private saveToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  // 🔹 Récupérer le token
  private getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // 🔹 Vérifier si dans le navigateur
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // 🔹 Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 🔹 Déconnexion
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    console.log('👋 Déconnexion réussie');
  }

  // 🔹 Récupérer les utilisateurs avec ajout manuel du token
  getUsers(): Observable<any> {
    const token = this.getToken();

    if (!token) {
      console.error('❌ Aucun token trouvé, utilisateur non authentifié.');
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(this.usersUrl, { headers }).pipe(
      tap(data => console.log('✅ Utilisateurs récupérés', data)),
      catchError(err => {
        console.error('❌ Erreur lors du chargement des utilisateurs', err);
        return throwError(() => new Error(err.error.message || 'Erreur lors du chargement des utilisateurs'));
      })
    );
  }
  deleteUser(id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.delete(`${this.usersUrl}/${id}`, { headers });
  }
  updateUser(id: number, data: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.put(`${this.usersUrl}/${id}`, data, { headers });
  }
  
}
