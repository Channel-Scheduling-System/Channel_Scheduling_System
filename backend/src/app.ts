import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './config/cors.js';
import { apiLimiter } from './config/security.js';
import { notFoundMiddleware } from './shared/middlewares/not-found.middleware.js';
import { handleErrorMiddleware } from './shared/middlewares/error.middleware.js';
import authRouter from './modules/auth/index.js';
import userRouter from './modules/users/index.js';
import serviceRouter from './modules/services/index.js';
import availabilityRouter from './modules/availability/index.js';
import appointmentRouter from './modules/appointments/index.js';

const API_PREFIX = '/api';
const REQUEST_BODY_LIMIT = '10mb';

const app = express();

app.set('trust proxy', 1); // Required when running behind reverse proxies

// SECURITY MIDDLEWARES
app.use(helmet());

// BODY PARSING MIDDLEWARES
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ limit: REQUEST_BODY_LIMIT, extended: true }));
app.use(cookieParser());

// CORS MIDDLEWARE
app.use(corsMiddleware);
// RATE LIMITING MIDDLEWARE
app.use(API_PREFIX, apiLimiter);

// =================================================================

// HEALTH CHECK
app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// API ROUTES
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/services`, serviceRouter);
app.use(`${API_PREFIX}/availability`, availabilityRouter);
app.use(`${API_PREFIX}/appointments`, appointmentRouter);

// =================================================================

// 404 HANDLER
app.use(notFoundMiddleware);
// ERROR HANDLING MIDDLEWARE
app.use(handleErrorMiddleware);

export default app;
