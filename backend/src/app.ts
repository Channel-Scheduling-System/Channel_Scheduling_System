import express from 'express';
import cors from 'cors';
import { handleErrorMiddleware } from './shared/middlewares/error.middleware.js';
import authRouter from './modules/auth/index.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:1420';
const allowedOrigins = [FRONTEND_URL];

const options: cors.CorsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

const app = express();
app.use(express.json());
app.use(
    (cors as (options: cors.CorsOptions) => express.RequestHandler)(options),
);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(handleErrorMiddleware);

export default app;
