import 'dotenv/config.js';

import { env } from './config/env.js';
import app from './app.js';
import prisma from './config/prisma.js';

async function run() {
    try {
        await prisma.$connect();
        app.listen(env.port, async () => {
            console.info(`Backend escuchando en http://localhost:${env.port}`);
            console.info(`CORS FRONTEND_URL configurado: ${env.frontendUrl}`);
        });
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        process.exit(1);
    }
}

await run();
