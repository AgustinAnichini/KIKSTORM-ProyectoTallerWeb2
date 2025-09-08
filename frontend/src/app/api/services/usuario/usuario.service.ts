import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment.prod.';
import { Usuario, UsuarioRegistro } from '../../../modules/usuario/interfaces/usuario.interface';
import { Observable } from 'rxjs';
import { UsuarioRest } from './interfaces/usuario.interface.rest';
import { UsuarioMapper } from './mappings/usuario.mapper';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

    http = inject(HttpClient)

  constructor() { }

  // src/app/api/services/usuario/usuario.service.ts
crearUsuario(usuario: UsuarioRegistro) {
  return this.http.post<AuthResponse>(`${environment.api_url}/auth/register`, usuario);
}

iniciarSesion(data: { email: string; password: string }) {
  return this.http.post<AuthResponse>(`${environment.api_url}/auth/login`, data);
}

  forgotPassword(email: string) {
  return this.http.post(`${environment.api_url}/auth/forgot-password`, { email });
}

resetPassword(token: string, password: string) {
  return this.http.post(`${environment.api_url}/auth/reset-password`, { token, password });
}

}