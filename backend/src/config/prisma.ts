import { env } from './env.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/client/client.js';

const databaseUrl = new URL(env.database.url);
const databasePortFromUrl = databaseUrl.port
    ? Number.parseInt(databaseUrl.port, 10)
    : 3306;

const adapter = new PrismaMariaDb({
    host: databaseUrl.hostname || env.database.host,
    user: decodeURIComponent(databaseUrl.username) || env.database.user,
    password: decodeURIComponent(databaseUrl.password) || env.database.password,
    database: databaseUrl.pathname.replace(/^\//, '') || env.database.name,
    port: databasePortFromUrl,
    connectionLimit: 10,
    connectTimeout: 30000,
});
const prisma = new PrismaClient({ adapter });

export default prisma;
