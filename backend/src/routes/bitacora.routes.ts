import { Router } from 'express';
import {
  registrarBitacora,
  listarBitacoras,
  obtenerBitacora,
  obtenerBitacoraExpediente,
  obtenerEstadisticas,
  limpiarBitacora,
} from '../controllers/bitacora.controller';
import { authMiddleware, requireRoles } from '../middleware/auth.middleware';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authMiddleware);

/**
 * POST /api/bitacora
 * Registrar nueva entrada en bitácora
 * Acceso: Todos los usuarios autenticados
 */
router.post('/', registrarBitacora);

/**
 * GET /api/bitacora
 * Listar bitácoras con filtros
 * Acceso: Admin y Coordinador de Archivo
 */
router.get('/', requireRoles('ADMIN', 'COORDINADOR_ARCHIVO'), listarBitacoras);

/**
 * GET /api/bitacora/stats
 * Obtener estadísticas de bitácora
 * Acceso: Admin y Coordinador de Archivo
 */
router.get('/stats', requireRoles('ADMIN', 'COORDINADOR_ARCHIVO'), obtenerEstadisticas);

/**
 * GET /api/bitacora/expediente/:expedienteId
 * Obtener bitácora de un expediente específico
 * Acceso: Todos los usuarios autenticados (con validación de permisos)
 */
router.get('/expediente/:expedienteId', obtenerBitacoraExpediente);

/**
 * GET /api/bitacora/:id
 * Obtener bitácora por ID
 * Acceso: Admin y Coordinador de Archivo
 */
router.get('/:id', requireRoles('ADMIN', 'COORDINADOR_ARCHIVO'), obtenerBitacora);

/**
 * DELETE /api/bitacora/limpiar
 * Eliminar registros antiguos de bitácora
 * Acceso: Solo Admin
 */
router.delete('/limpiar', requireRoles('ADMIN'), limpiarBitacora);

export default router;
