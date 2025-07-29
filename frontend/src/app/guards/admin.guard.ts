import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthUsuarioService } from '../api/services/usuario/auth-usuario.service'; 

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthUsuarioService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const usuario = this.authService.obtenerUsuarioDesdeLocalStorage(); 

    if (usuario && usuario.role === 'ADMIN') {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
