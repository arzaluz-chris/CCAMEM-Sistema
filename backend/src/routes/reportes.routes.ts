import { Router } from 'express';
import reportesController from '../controllers/reportes.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Estadísticas para el dashboard
router.get('/stats', reportesController.getStats.bind(reportesController));

// Reportes de inventario
router.get('/inventario/general', reportesController.generarInventarioGeneral.bind(reportesController));
router.get('/inventario/unidad/:unidadId', reportesController.generarInventarioPorUnidad.bind(reportesController));
router.get('/inventario/uaa/:unidadId?', reportesController.generarInventarioUAA.bind(reportesController));

// Reporte de estadísticas
router.get('/estadisticas', reportesController.generarEstadisticas.bind(reportesController));

// Reporte de bitácora (solo admins y coordinadores)
router.get(
  '/bitacora',
  authorize('ADMIN', 'COORDINADOR_ARCHIVO'),
  reportesController.generarBitacora.bind(reportesController)
);

export default router;
