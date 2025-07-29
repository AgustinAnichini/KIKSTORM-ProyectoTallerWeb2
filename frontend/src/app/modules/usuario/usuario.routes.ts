import { Routes } from "@angular/router";
import { SigninComponent } from "./pages/signin/signin.component";
import { SignupComponent } from "./pages/signup/signup.component";
import { AuthUsuarioService } from "../../api/services/usuario/auth-usuario.service";
import { inject } from "@angular/core";
import { AdminGuard } from "../../guards/admin.guard";

   
export const usuarioRoutes: Routes = [
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'signin',
    loadComponent: () =>
      import('./pages/signin/signin.component').then(m => m.SigninComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  }
];