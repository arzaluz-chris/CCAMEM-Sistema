import { Router } from 'express';
import prestamosController from '../controllers/prestamos.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar préstamos
router.get('/', prestamosController.listar);

// Obtener préstamo por ID
router.get('/:id', prestamosController.obtenerPorId);

// Obtener préstamos por expediente
router.get('/expediente/:expedienteId', prestamosController.obtenerPorExpediente);

// Estadísticas de préstamos
router.get('/stats/general', prestamosController.estadisticas);

// Solicitar préstamo (cualquier usuario autenticado)
router.post('/solicitar', prestamosController.solicitar);

// Autorizar préstamo (solo coordinador de archivo y admin)
router.post(
  '/:id/autorizar',
  roleMiddleware(['ADMIN', 'COORDINADOR_ARCHIVO']),
  prestamosController.autorizar
);

// Rechazar préstamo (solo coordinador de archivo y admin)
router.post(
  '/:id/rechazar',
  roleMiddleware(['ADMIN', 'COORDINADOR_ARCHIVO']),
  prestamosController.rechazar
);

// Devolver préstamo
router.post('/:id/devolver', prestamosController.devolver);

export default router;
