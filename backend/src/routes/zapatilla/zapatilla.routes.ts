import { Router } from "express";
import { ZapatillaController } from "../../controller/zapatilla.controller";
import multer from 'multer';
import path from 'path';

export const zapatillaRouter = Router();

const zapatillaController = new ZapatillaController();

// Configurar multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../../../frontend/public/img');
    cb(null, uploadPath);  
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});
const upload = multer({ storage });

// multer SOLO en la ruta POST (crear zapatilla)
zapatillaRouter.post('/', upload.single('imagen'), zapatillaController.create.bind(zapatillaController));

zapatillaRouter.get('/', zapatillaController.findAll.bind(zapatillaController));
zapatillaRouter.get('/:id', zapatillaController.findById.bind(zapatillaController));
zapatillaRouter.put('/:id', zapatillaController.update.bind(zapatillaController));
zapatillaRouter.delete('/:id', zapatillaController.delete.bind(zapatillaController));
