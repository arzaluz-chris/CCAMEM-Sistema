import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad con Helmet
app.use(helmet());

// CORS - permitir múltiples orígenes para desarrollo
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman) o desde orígenes permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RUTAS
// ============================================

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión Archivística CCAMEM - API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Rutas de la API
app.use('/api', routes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use(notFoundHandler);

// Manejador global de errores
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async (): Promise<void> => {
  try {
    // Conectar a la base de datos
    await connectDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏛️  Sistema de Gestión Archivística CCAMEM              ║
║                                                            ║
║   🚀 Servidor iniciado correctamente                       ║
║   📡 Puerto: ${PORT}
║   🌍 Entorno: ${process.env.NODE_ENV || 'development'}
║   📝 URL: http://localhost:${PORT}
║   💚 Health: http://localhost:${PORT}/api/health
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Manejo de errores no capturados
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;
