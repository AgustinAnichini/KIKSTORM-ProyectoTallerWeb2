import { Component, OnInit, inject, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment.prod.';
import { Stock, Zapatilla } from '../../../interfaces';
import { ButtonModule } from 'primeng/button';
import { CarritoService } from '../../api/services/carrito/carrito.service';
import Swal from 'sweetalert2';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthUsuarioService } from '../../api/services/usuario/auth-usuario.service';  
import { ZapatillaService } from '../../api/services/zapatilla/zapatilla.service';

@Component({
  selector   : 'app-product-detail',
  standalone : true,
  imports    : [CommonModule, NgIf, NgFor, ButtonModule],
  templateUrl: './product-detail.component.html',
  styleUrls  : ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {


  private route   = inject(ActivatedRoute);
  private http    = inject(HttpClient);
  private carrito = inject(CarritoService);
  private authService = inject(AuthUsuarioService);
  private router      = inject(Router);  

  constructor(
  @Optional() private dialogConfig: DynamicDialogConfig,
  @Optional() public  dialogRef  : DynamicDialogRef,
){}

  // ---------------------------------------------------------------------

  selectedStock?: Stock;
  agregando     = false;
  zapatillaService= inject(ZapatillaService)

  zapatilla?: Zapatilla;
  loading   = true;
  errorMsg  = '';

  /* --------------------------- life-cycle --------------------------- */
  ngOnInit(): void {

    const idFromDialog = this.dialogConfig?.data?.id as number | undefined;
    const id = idFromDialog ?? Number(this.route.snapshot.paramMap.get('id'));

    if (!id) { this.errorMsg = 'Producto no encontrado'; return; }

   this.zapatillaService.getZapatillaById(id).subscribe({
      next : d => { this.zapatilla = d; this.loading = false; },
      error: _ => { this.errorMsg  = 'Producto no encontrado'; this.loading = false; }
   })
  }

  /* ---------------------------- helpers ----------------------------- */
  formatPrice(n: number){ return n.toLocaleString('es-AR'); }

  seleccionarTalle(s: Stock){
    if (!s.activo || s.cantidad === 0) return;
    this.selectedStock = s;
  }

 
  cerrar(){ this.dialogRef?.close(); }

  /* ------------------ botón "Agregar al carrito" ------------------- */
  agregarAlCarrito(){

    if (!this.authService.token) {
  this.dialogRef?.close();

  setTimeout(() => {
    Swal.fire({
      title            : 'Iniciá sesión',
      text             : 'Debes iniciar sesión para comprar.',
      icon             : 'info',
      confirmButtonText: 'Ir al login',
      showCancelButton : true,
      cancelButtonText : 'Cancelar'
    }).then(r => {
      if (r.isConfirmed) this.router.navigate(['/usuario/signin']);
    });
  }, 200); 

  return;
    }

    if (!this.selectedStock || this.agregando) return;

    this.agregando = true;
    this.carrito.agregarAlCarrito({
      stockId : this.selectedStock.id,
      cantidad: 1
    }).subscribe({
      next: () => {
        this.agregando = false;
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: 'Agregado al carrito', timer: 1200, showConfirmButton: false
        });
        this.dialogRef?.close();
      },
      error: () => {
        this.agregando = false;
        Swal.fire({
          toast: true, position: 'top-end', icon: 'error',
          title: 'Ocurrió un error', timer: 2000, showConfirmButton: false
        });
      }
    });
  }
}


