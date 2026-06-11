import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/client/client.js';
import { env } from './env.js';

const DEFAULT_CONNECTION_LIMIT = 10;
const CONNECTION_TIMEOUT_MS = 30_000;

function createMariaDbAdapter(): PrismaMariaDb {
    const databaseUrl = new URL(env.databaseUrl);

    return new PrismaMariaDb({
        host: databaseUrl.hostname,
        port: databaseUrl.port ? Number.parseInt(databaseUrl.port, 10) : 3306,
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database: databaseUrl.pathname.slice(1),
        connectionLimit: DEFAULT_CONNECTION_LIMIT,
        connectTimeout: CONNECTION_TIMEOUT_MS,
    });
}

const prisma = new PrismaClient({
    adapter: createMariaDbAdapter(),
});

export default prisma;
