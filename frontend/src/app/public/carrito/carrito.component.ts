import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../api/services/carrito/carrito.service';
import { Carrito } from '../../../interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Carrito | null = null;
  loading = true;
  updating = false;
  mensaje = '';
  esError = false;

  constructor(
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.carritoService.carrito$.subscribe((carrito) => {
      this.carrito = carrito;
      this.loading = false;
    });

    // Cargar carrito si no está cargado
    if (!this.carrito) {
      this.carritoService.refrescarCarrito();
    }
  }

  actualizarCantidad(itemId: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) return;

    this.updating = true;
    this.carritoService.actualizarCantidad(itemId, { cantidad: nuevaCantidad }).subscribe({
      next: (response) => {
        this.updating = false;
      },
      error: (error) => {
        this.updating = false;
        console.error('Error:', error);
      }
    });
  }

  eliminarItem(itemId: number): void {
    Swal.fire({
      title: 'Confirmar eliminación',
      text: '¿Estás seguro de que quieres eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updating = true;
        this.carritoService.eliminarItem(itemId).subscribe({
          next: (response) => {
            this.updating = false;
            Swal.fire({
              title: '¡Eliminado!',
              text: 'Producto eliminado del carrito',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.updating = false;
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar producto',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error('Error:', error);
          }
        });
      }
    });
  }

  vaciarCarrito(): void {
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
          next: (response) => {
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

  finalizarCompra(): void {
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

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensaje = mensaje;
    this.esError = esError;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
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
