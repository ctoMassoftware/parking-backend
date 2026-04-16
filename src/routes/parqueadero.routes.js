import { Router } from 'express';
import { 
    registrarIngreso,
    calcularSalida,
    finalizarServicio,
    getDisponibilidad
} from '../controllers/parqueadero.controller.js';

const router = Router();

// Entra el carro
router.post('/ingreso', registrarIngreso);

// Lees el ticket con la pistola (El :id es dinámico)
router.get('/salida/:id', calcularSalida);

// Le cobras al cliente
router.post('/finalizar', finalizarServicio);

// Da la disposicion del parqueadero
router.get('/disponibilidad', getDisponibilidad);

export default router;