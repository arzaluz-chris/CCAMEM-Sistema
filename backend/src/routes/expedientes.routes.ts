import { Router } from 'express';
import expedientesController from '../controllers/expedientes.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Buscar expedientes
router.get('/search', expedientesController.search.bind(expedientesController));

// CRUD de expedientes
router.post(
  '/',
  authorize('ADMIN', 'COORDINADOR_ARCHIVO', 'RESPONSABLE_AREA', 'OPERADOR'),
  expedientesController.create.bind(expedientesController)
);

router.get('/', expedientesController.findAll.bind(expedientesController));

router.get('/:id', expedientesController.findById.bind(expedientesController));

router.put(
  '/:id',
  authorize('ADMIN', 'COORDINADOR_ARCHIVO', 'RESPONSABLE_AREA', 'OPERADOR'),
  expedientesController.update.bind(expedientesController)
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  expedientesController.delete.bind(expedientesController)
);

export default router;
