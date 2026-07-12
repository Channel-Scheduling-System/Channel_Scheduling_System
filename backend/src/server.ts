import 'dotenv/config.js';

import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';
import { startAppointmentScheduler } from './scheduler/appointment.scheduler.js';

async function run() {
    let server: ReturnType<typeof app.listen> | undefined;
    const task = startAppointmentScheduler();

    const shutdown = async (code = 0) => {
        try {
            console.info('Cerrando aplicación...');
            await task.stop();
            if (server) await closeServer(server);
            await prisma.$disconnect();
        } catch (error) {
            console.error('Error durante el cierre:', error);
            code = 1;
        } finally {
            process.exit(code);
        }
    };

    process.once('SIGINT', () => shutdown(0));
    process.once('SIGTERM', () => shutdown(0));

    try {
        await prisma.$connect();
        server = app.listen(env.port, () => {
            console.info(`Backend escuchando en http://localhost:${env.port}`);
            console.info(`FRONTEND_URL configurado en: ${env.frontendUrl}`);
        });
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        await shutdown(1);
    }
}

async function closeServer(server: ReturnType<typeof app.listen>) {
    return new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
    });
}

await run();
