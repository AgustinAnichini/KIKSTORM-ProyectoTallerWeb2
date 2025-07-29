import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthUsuarioService } from '../../api/services/usuario/auth-usuario.service';
import { Carrito } from '../../../interfaces';
import { CarritoService } from '../../api/services/carrito/carrito.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf, DrawerModule, ButtonModule, CommonModule,OverlayPanelModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  cart  = '/img/cart-1.svg';
  cart1 = '/img/cart.svg';
  visible2 = false;

  // Propiedades del carrito
  carrito: Carrito | null = null;
  cantidadTotal = 0;
  updating = false;

  private auth   = inject(AuthUsuarioService);
  private router = inject(Router);
  private carritoService = inject(CarritoService);


  usuarioLogueado = this.auth.usuario;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
  // Suscribirse al carrito
  this.carritoService.carrito$.subscribe((carrito: Carrito | null) => {
    this.carrito = carrito;
    this.cantidadTotal = carrito ? carrito.cantidadTotal : 0;
  });
  }

  // Métodos del carrito
  actualizarCantidad(itemId: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) return;

    this.updating = true;
    this.carritoService.actualizarCantidad(itemId, { cantidad: nuevaCantidad }).subscribe({
      next: () => {
        this.updating = false;
      },
      error: (error) => {
        this.updating = false;
        this.visible2 = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al actualizar cantidad',
          text: error.error?.message || 'Inténtalo de nuevo más tarde.',
          showConfirmButton: false,
          timer: 2000,
          width: '20em',
          padding: '1em'
        });
      }
    });
  }

  eliminarItem(itemId: number): void {
    this.updating = true;
    this.carritoService.eliminarItem(itemId).subscribe({
      next: () => {
        this.updating = false;
      },
      error: (error) => {
        this.updating = false;
        this.visible2 = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al eliminar item',
          text: error.error?.message || 'Inténtalo de nuevo más tarde.',
          showConfirmButton: false,
          timer: 2000,
          width: '20em',
          padding: '1em'
        });
      }
    });
  }

  vaciarCarrito(): void {
    this.visible2 = false;
    Swal.fire({
      title: 'Vaciar carrito',
      text: '¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updating = true;
        this.carritoService.vaciarCarrito().subscribe({
          next: () => {
            this.updating = false;
            Swal.fire({
              title: '¡Carrito vaciado!',
              text: 'El carrito ha sido vaciado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.updating = false;
            Swal.fire({
              title: 'Error',
              text: 'Error al vaciar carrito',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error('Error:', error);
          }
        });
      }
    });
  }

  irAlCarrito(): void {
    this.visible2 = false;
    this.router.navigate(['/carrito']);
  }

  finalizarCompra(): void {
    this.visible2 = false;
    Swal.fire({
      title: 'Finalizar compra',
      text: '¿Estás listo para finalizar tu compra? Se procesará el pago y se enviará tu pedido.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updating = true;
        this.carritoService.finalizarCompra().subscribe({
          next: () => {
            this.updating = false;
            Swal.fire({
              title: '¡Compra finalizada!',
              text: 'Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación.',
              icon: 'success',
              confirmButtonText: 'Perfecto'
            });
          },
          error: (error) => {
            this.updating = false;
            Swal.fire({
              title: 'Error en la compra',
              text: 'Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error('Error:', error);
          }
        });
      }
    });
  }

  getImagePath(imagen: string | null | undefined): string {
    if (!imagen) {
      return '/img/zapatilla-1.webp';
    }

    if (imagen.startsWith('/img/')) {
      return imagen;
    }

    return `/img/${imagen}`;
  }
}
