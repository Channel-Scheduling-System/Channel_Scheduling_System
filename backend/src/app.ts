import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './config/cors.js';
import { apiLimiter } from './config/security.js';
import { handleErrorMiddleware } from './shared/middlewares/error.middleware.js';
import authRouter from './modules/auth/auth.routes.js';

const app = express();

// SECURITY MIDDLEWARES
//* -----------------------------
// Helmet - Headers de seguridad HTTP
app.use(helmet());

// BODY PARSING MIDDLEWARES
//* -----------------------------
app.use(express.json({ limit: '10mb' })); // Límite de tamaño
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// CORS MIDDLEWARES
//* -----------------------------
app.use(corsMiddleware);

// RATE LIMITING MIDDLEWARES
//* -----------------------------
app.use('/api/', apiLimiter);

// =================================================================

// HEALTH CHECK
//* -----------------------------
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API ROUTES
//* -----------------------------
app.use('/api/auth', authRouter);

// =================================================================

// 404 HANDLER
//* -----------------------------
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
    });
});

// ERROR HANDLING MIDDLEWARE
//* -----------------------------
app.use(handleErrorMiddleware);

export default app;
