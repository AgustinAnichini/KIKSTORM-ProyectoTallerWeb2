import { Request, Response } from 'express';
import { CarritoService } from '../services/carrito.service';

export class CarritoController {
  private carritoService: CarritoService;

  constructor() {
    this.carritoService = new CarritoService();
  }

  async obtenerCarrito(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = 1
      
      const carrito = await this.carritoService.obtenerCarritoUsuario(usuarioId);
      
      res.json({
        success: true,
        data: carrito
      });
    } catch (error) {
      console.error('Error en obtenerCarrito:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async agregarAlCarrito(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = 1; // (req as any).user?.id;

      const { stockId, cantidad } = req.body;

      if (!stockId || !cantidad) {
        res.status(400).json({
          success: false,
          message: 'stockId y cantidad son requeridos'
        });
        return;
      }

      if (cantidad <= 0) {
        res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor a 0'
        });
        return;
      }

      const carrito = await this.carritoService.agregarAlCarrito(usuarioId, {
        stockId: parseInt(stockId),
        cantidad: parseInt(cantidad)
      });

      res.json({
        success: true,
        data: carrito,
        message: 'Producto agregado al carrito'
      });
    } catch (error) {
      console.error('Error en agregarAlCarrito:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al agregar al carrito'
      });
    }
  }

  async actualizarCantidad(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = 1; // (req as any).user?.id;
      const { itemId } = req.params;
      const { cantidad } = req.body;

      if (!cantidad) {
        res.status(400).json({
          success: false,
          message: 'La cantidad es requerida'
        });
        return;
      }

      const carrito = await this.carritoService.actualizarCantidad(
        usuarioId,
        parseInt(itemId),
        { cantidad: parseInt(cantidad) }
      );

      res.json({
        success: true,
        data: carrito,
        message: 'Cantidad actualizada'
      });
    } catch (error) {
      console.error('Error en actualizarCantidad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar cantidad'
      });
    }
  }

  async eliminarItem(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = 1; // (req as any).user?.id;
      const { itemId } = req.params;

      const carrito = await this.carritoService.eliminarItem(usuarioId, parseInt(itemId));

      res.json({
        success: true,
        data: carrito,
        message: 'Item eliminado del carrito'
      });
    } catch (error) {
      console.error('Error en eliminarItem:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar item'
      });
    }
  }

  async vaciarCarrito(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = 1; // (req as any).user?.id;

      const carrito = await this.carritoService.vaciarCarrito(usuarioId);

      res.json({
        success: true,
        data: carrito,
        message: 'Carrito vaciado'
      });
    } catch (error) {
      console.error('Error en vaciarCarrito:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al vaciar carrito'
      });
    }
  }

  async finalizarCompra(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = 1; // (req as any).user?.id;

      const resultado = await this.carritoService.finalizarCompra(usuarioId);

      res.json({
        success: true,
        data: resultado,
        message: resultado.mensaje
      });
    } catch (error) {
      console.error('Error en finalizarCompra:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al finalizar compra'
      });
    }
  }
}
