import { Router } from 'express';
import usuariosController from '../controllers/usuarios.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Estadísticas (solo admin)
router.get(
  '/stats',
  roleMiddleware(['ADMIN']),
  usuariosController.estadisticas
);

// Listar usuarios (solo admin y coordinador)
router.get(
  '/',
  roleMiddleware(['ADMIN', 'COORDINADOR_ARCHIVO']),
  usuariosController.listar
);

// Obtener usuario por ID
router.get('/:id', usuariosController.obtenerPorId);

// Crear usuario (solo admin)
router.post(
  '/',
  roleMiddleware(['ADMIN']),
  usuariosController.crear
);

// Actualizar usuario (solo admin)
router.put(
  '/:id',
  roleMiddleware(['ADMIN']),
  usuariosController.actualizar
);

// Cambiar contraseña (el mismo usuario o admin)
router.post('/:id/cambiar-password', usuariosController.cambiarPassword);

// Activar/Desactivar usuario (solo admin)
router.patch(
  '/:id/toggle-activo',
  roleMiddleware(['ADMIN']),
  usuariosController.toggleActivo
);

// Eliminar usuario (solo admin)
router.delete(
  '/:id',
  roleMiddleware(['ADMIN']),
  usuariosController.eliminar
);

export default router;
