import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service.service';
import { PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  role: string = 'technicien';
  users: any[] = [];
  private router = inject(Router);

  isEditing: boolean = false;
  editUserId: number | null = null;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('⏳ Exécution côté serveur.');
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      console.log('✅ Exécution côté client, chargement des utilisateurs.');
      this.loadUsers();
    }
  }

  onSubmit() {
    console.log('📝 Inscription en cours avec:', { email: this.email, password: this.password, role: this.role });

    this.authService.register(this.email, this.password, this.role).subscribe(
      response => {
        console.log('✅ Inscription réussie', response);
        alert('Compte créé avec succès !');

        if (isPlatformBrowser(this.platformId)) {
          this.loadUsers(); // 🔄 Recharger la liste uniquement côté client
        }
      },
      error => {
        console.error('❌ Erreur lors de l\'inscription', error);
        if (isPlatformBrowser(this.platformId)) {
          alert('Erreur...');
        } else {
          console.error('Erreur côté serveur.');
        }
      }
    );
  }

  loadUsers() {
    this.authService.getUsers().subscribe({
      next: (users) => {
        console.log('📄 Utilisateurs récupérés :', users);
        this.users = users;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs', error.message);
        if (isPlatformBrowser(this.platformId)) {
          alert(`Erreur : ${error.message}`);
        }
      }
    });
  }
  contextMenuVisible = false;
contextMenuPosition = { x: 0, y: 0 };
selectedUser: any = null;

openContextMenu(event: MouseEvent, user: any) {
  event.preventDefault();
  this.selectedUser = user;
  this.contextMenuPosition.x = event.clientX;
  this.contextMenuPosition.y = event.clientY;
  this.contextMenuVisible = true;
}

editedUser: any = null;

startEdit(user: any) {
  this.editedUser = { ...user };
  this.contextMenuVisible = false; // Ferme le menu contextuel
}

saveEdit() {
  this.authService.updateUser(this.editedUser.id, {
    email: this.editedUser.email,
    role: this.editedUser.role,
  }).subscribe({
    next: (updatedUser) => {
      this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
      this.editedUser = null;
    },
    error: (err) => {
      console.error('❌ Error updating user:', err);
    }
  });
}

cancelEdit() {
  this.editedUser = null;
}



deleteUser(user: any) {
  if (confirm(`Are you sure you want to delete ${user.email}?`)) {
    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        console.log('✅ User deleted');
        this.users = this.users.filter(u => u.id !== user.id); // Retire l'utilisateur de l'affichage
        this.contextMenuVisible = false;
      },
      error: (err) => {
        console.error('❌ Error deleting user:', err);
      }
    });
  }
}


@HostListener('document:click')
onDocumentClick() {
  this.contextMenuVisible = false;
}

}
