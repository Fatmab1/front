import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AdminComponent } from './admin/admin/admin.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { FactoryComponent } from './factory/factory.component';
import { TreeSelectPageComponent } from './tree-select-page/tree-select-page.component';


export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, 
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },  // ✅ Vérifie que cette ligne est bien présente
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'factory', component: FactoryComponent },
  { path: 'tree', component: TreeSelectPageComponent },


  { path: '**', redirectTo: 'auth/login' } // Redirection vers login si la route n'existe pas
];

