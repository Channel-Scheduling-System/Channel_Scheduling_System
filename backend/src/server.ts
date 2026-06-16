import 'dotenv/config.js';

import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';

async function run() {
    try {
        await prisma.$connect();

        const server = app.listen(env.port, () => {
            console.info(`Backend escuchando en http://localhost:${env.port}`);
            console.info(`FRONTEND_URL configurado en: ${env.frontendUrl}`);
        });

        const shutdown = async () => {
            console.info('Cerrando aplicación...');
            server.close();
            await prisma.$disconnect();
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        process.exit(1);
    }
}

await run();
