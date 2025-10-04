import { Router } from 'express';
import catalogosController from '../controllers/catalogos.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Catálogos principales
router.get('/unidades', catalogosController.getUnidadesAdministrativas.bind(catalogosController));
router.get('/secciones', catalogosController.getSecciones.bind(catalogosController));
router.get('/secciones/:seccionId/series', catalogosController.getSeriesBySeccion.bind(catalogosController));
router.get('/series/:serieId/subseries', catalogosController.getSubseriesBySerie.bind(catalogosController));
router.get('/estructura-completa', catalogosController.getEstructuraCompleta.bind(catalogosController));

// Estadísticas
router.get('/estadisticas', catalogosController.getEstadisticas.bind(catalogosController));

// Catálogos auxiliares
router.get('/valores-documentales', catalogosController.getValoresDocumentales.bind(catalogosController));
router.get('/estados-expediente', catalogosController.getEstadosExpediente.bind(catalogosController));
router.get('/clasificaciones-info', catalogosController.getClasificacionesInfo.bind(catalogosController));

export default router;
