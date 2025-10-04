import { Router } from 'express';
import authRoutes from './auth.routes';
import expedientesRoutes from './expedientes.routes';
import catalogosRoutes from './catalogos.routes';
import reportesRoutes from './reportes.routes';
import prestamosRoutes from './prestamos.routes';
import usuariosRoutes from './usuarios.routes';
import bitacoraRoutes from './bitacora.routes';

const router = Router();

// Ruta de health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API CCAMEM funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Rutas de módulos
router.use('/auth', authRoutes);
router.use('/expedientes', expedientesRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/reportes', reportesRoutes);
router.use('/prestamos', prestamosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/bitacora', bitacoraRoutes);

// TODO: Agregar más rutas de módulos
// router.use('/transferencias', transferenciasRoutes);

export default router;
