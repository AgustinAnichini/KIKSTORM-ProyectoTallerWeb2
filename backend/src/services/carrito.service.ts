import { CarritoRepository } from '../repository/carrito.repository';
import { AgregarAlCarritoDto, ActualizarCantidadDto } from '../types/carrito.type';

export class CarritoService {
  private carritoRepository: CarritoRepository;

  constructor() {
    this.carritoRepository = new CarritoRepository();
  }

  async obtenerCarritoUsuario(usuarioId: number) {
    try {
      let carrito = await this.carritoRepository.obtenerCarritoActivoPorUsuario(usuarioId);
      
      if (!carrito) {
        carrito = await this.carritoRepository.crearCarrito(usuarioId);
      }

      // Calcular totales
     const total = carrito.items.reduce((sum: number, item: any) => {
     return sum + (Number(item.stock.zapatilla.precio) * item.cantidad);
    }, 0);


    const cantidadTotal = carrito.items.reduce((sum: number, item: any) => sum + item.cantidad, 0);

      return {
        ...carrito,
        total,
        cantidadTotal
      };
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      throw new Error('Error al obtener el carrito');
    }
  }

  async agregarAlCarrito(usuarioId: number, data: AgregarAlCarritoDto) {
    try {
      // Verificar que el stock exista y tenga cantidad disponible
      const stock = await this.carritoRepository.obtenerStockPorId(data.stockId);
      if (!stock) {
        throw new Error('Stock no encontrado');
      }

      if (!stock.activo) {
        throw new Error('El producto no está disponible');
      }

      if (stock.cantidad < data.cantidad) {
        throw new Error('Stock insuficiente');
      }

      // Obtener o crear carrito
      let carrito = await this.carritoRepository.obtenerCarritoActivoPorUsuario(usuarioId);
      if (!carrito) {
        carrito = await this.carritoRepository.crearCarrito(usuarioId);
      }

      // Agregar item al carrito
      await this.carritoRepository.agregarItem(carrito.id, data.stockId, data.cantidad);

      // Retornar carrito actualizado
      return await this.obtenerCarritoUsuario(usuarioId);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al agregar producto al carrito');
    }
  }

  async actualizarCantidad(usuarioId: number, itemId: number, data: ActualizarCantidadDto) {
    try {
      if (data.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      // Verificar que el item pertenece al usuario
      const carrito = await this.carritoRepository.obtenerCarritoActivoPorUsuario(usuarioId);
      if (!carrito) {
        throw new Error('Carrito no encontrado');
      }

      const item = carrito.items.find((i: any) => i.id === itemId);
      if (!item) {
        throw new Error('Item no encontrado en el carrito');
      }

      // Verificar stock disponible
      if (item.stock.cantidad < data.cantidad) {
        throw new Error('Stock insuficiente');
      }

      await this.carritoRepository.actualizarCantidadItem(itemId, data.cantidad);

      return await this.obtenerCarritoUsuario(usuarioId);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar cantidad');
    }
  }

  async eliminarItem(usuarioId: number, itemId: number) {
    try {
      // Verificar que el item pertenece al usuario
      const carrito = await this.carritoRepository.obtenerCarritoActivoPorUsuario(usuarioId);
      if (!carrito) {
        throw new Error('Carrito no encontrado');
      }

    const item = carrito.items.find((i: any) => i.id === itemId);
      if (!item) {
        throw new Error('Item no encontrado en el carrito');
      }

      await this.carritoRepository.eliminarItem(itemId);

      return await this.obtenerCarritoUsuario(usuarioId);
    } catch (error) {
      console.error('Error al eliminar item:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al eliminar item del carrito');
    }
  }

  async vaciarCarrito(usuarioId: number) {
    try {
      const carrito = await this.carritoRepository.obtenerCarritoActivoPorUsuario(usuarioId);
      if (!carrito) {
        throw new Error('Carrito no encontrado');
      }

      await this.carritoRepository.vaciarCarrito(carrito.id);

      return await this.obtenerCarritoUsuario(usuarioId);
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al vaciar el carrito');
    }
  }

  async finalizarCompra(usuarioId: number) {
    try {
      const carrito = await this.carritoRepository.obtenerCarritoActivoPorUsuario(usuarioId);
      if (!carrito) {
        throw new Error('Carrito no encontrado');
      }

      if (carrito.items.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Verificar stock antes de finalizar
      for (const item of carrito.items) {
        if (item.stock.cantidad < item.cantidad) {
          throw new Error(`Stock insuficiente para ${item.stock.zapatilla.nombre}`);
        }
      }

      // Actualizar stock
      for (const item of carrito.items) {
        await this.carritoRepository.obtenerStockPorId(item.stockId);
      }

      // Finalizar carrito
      await this.carritoRepository.finalizarCarrito(carrito.id);

      return {
        mensaje: 'Compra realizada con éxito',
        carritoId: carrito.id
      };
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al finalizar la compra');
    }
  }
}
