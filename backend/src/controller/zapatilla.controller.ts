import { Request, Response } from 'express'
import { ZapatillaService } from '../services/zapatilla.service'
import { Prisma } from '@prisma/client'; // <-- necesario para Decimal


export class ZapatillaController {
    private service = new ZapatillaService()

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const filters = req.query
            const zapatillas = await this.service.getFilteredZapatillas(filters)
            res.json(zapatillas)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error al obtener zapatillas' })
        }
    }

    async findById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id)
        if (isNaN(id)) {
            res.status(400).json({ error: 'ID inválido' })
            return
        }

        try {
            const zap = await this.service.getById(id)
            if (!zap) {
                res.status(404).json({ error: 'Zapatilla no encontrada' })
                return
            }
            res.json(zap)
        } catch (error) {
            res.status(500).json({ error: (error as Error).message })
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id)
        if (isNaN(id)) {
            res.status(400).json({ error: 'ID inválido' })
            return
        }

        try {
            const zap = await this.service.getById(id)
            if (!zap) {
                res.status(404).json({ error: 'Zapatilla no encontrada' })
                return
            }

            const updatedZap = await this.service.update(id, req.body)
            res.json(updatedZap)
        } catch (error) {
            res.status(400).json({ error: (error as Error).message })
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id)
        if (isNaN(id)) {
            res.status(400).json({ error: 'ID inválido' })
            return
        }

        try {
            const zap = await this.service.getById(id)
            if (!zap) {
                res.status(404).json({ error: 'Zapatilla no encontrada' })
                return
            }

            await this.service.delete(id)
            res.status(204).send() // Sin contenido, eliminación exitosa
        } catch (error) {
            res.status(500).json({ error: (error as Error).message })
        }
    }

    async create(req: Request, res: Response): Promise<void> {
            try {
                const file = req.file;

                if (!file) {
                    res.status(400).json({ error: 'Debes subir una imagen' });
                    return;
                }

                const {
                    nombre,
                    marcaId,
                    colorId,
                    sexo,
                    precio,
                    descripcion
                } = req.body;

                // Crear objeto con datos, incluyendo solo el nombre del archivo
                const data = {
                    nombre,
                    marcaId: Number(marcaId),
                    colorId: Number(colorId),
                    sexo,
                    precio: new Prisma.Decimal(precio), 
                    descripcion,
                    imagen: file.originalname // <== guarda solo el nombre de la imagen
                };

                const newZap = await this.service.create(data);

                res.status(201).json(newZap);
            } catch (error) {
                console.error('Error al crear zapatilla:', error);
                res.status(400).json({ error: (error as Error).message });
            }
        }

}
