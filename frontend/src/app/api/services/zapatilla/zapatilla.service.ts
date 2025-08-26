import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Zapatilla } from '../../../../interfaces';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZapatillaService {
  constructor(private http: HttpClient,) { }

  getMarcas(): Observable<string[]> {
    return this.http.get<any[]>(`${environment.api_url}/marca`).pipe(
      map((data) => data.map((m) => m.nombre.toLowerCase()))
    );
  }

  getTalles(): Observable<number[]> {
    return this.http.get<any[]>(`${environment.api_url}/talle`).pipe(
      map((data) => data.map((t) => t.numero))
    );
  }

  getColores(): Observable<string[]> {
    return this.http.get<any[]>(`${environment.api_url}/color`).pipe(
      map((data) => data.map((c) => c.nombre.toLowerCase()))
    );
  }

  getZapatillasFiltered(queryParams: any): Observable<Zapatilla[]> {
    return this.http.get<Zapatilla[]>(`${environment.api_url}/zapatilla`, {
      params: queryParams,
    });
  }

  getZapatillaById(id: number): Observable<Zapatilla>{
    return this.http.get<Zapatilla>(`${environment.api_url}/zapatilla/${id}`) 
  }

  getZapatillasLimit(): Observable<Zapatilla[]> {
  return this.http.get<Zapatilla[]>(`${environment.api_url}/zapatilla`)
    .pipe(
      map(zapatillas => zapatillas.slice(0, 4))
    );
  }
}
