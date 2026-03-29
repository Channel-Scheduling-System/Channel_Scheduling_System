import { env } from './env.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/client/client.js';

const databaseUrl = new URL(env.databaseUrl);

const adapter = new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: databaseUrl.port ? Number.parseInt(databaseUrl.port, 10) : 3306,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, ''),
    connectionLimit: 10,
    connectTimeout: 30000,
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;
