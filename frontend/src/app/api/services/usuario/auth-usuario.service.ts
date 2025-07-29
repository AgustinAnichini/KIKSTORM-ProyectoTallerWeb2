import { Injectable, signal } from '@angular/core';
import { Usuario } from '../../../modules/usuario/interfaces/usuario.interface';
import { AuthResponse } from '../../../api/services/usuario/interfaces/auth-response.interface';
import { UsuarioMapper } from '../../../api/services/usuario/mappings/usuario.mapper';

@Injectable({ providedIn: 'root' })
export class AuthUsuarioService {
  usuario = signal<Usuario | null>(null);
  _token  = signal<string | null>(null);

  constructor() {
    if (this.isBrowser()) {
      const rawUser  = localStorage.getItem('usuario');
      const rawToken = localStorage.getItem('token');
      if (rawUser)  this.usuario.set(JSON.parse(rawUser));
      if (rawToken) this._token.set(rawToken);
    }
  }

  login(resp: AuthResponse) {
    this.usuario.set(UsuarioMapper.mapUsuarioRestToUsuario(resp.usuario));
    this._token.set(resp.token);

    if (this.isBrowser()) {
      localStorage.setItem('usuario', JSON.stringify(resp.usuario));
      localStorage.setItem('token', resp.token);
    }
  }

  logout() {
    this.usuario.set(null);
    this._token.set(null);

    if (this.isBrowser()) {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    }
  }

  obtenerUsuarioDesdeLocalStorage(): Usuario | null {
    if (!this.isBrowser()) return null;

    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) as Usuario : null;
  }

  get token() {
    return this._token();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
