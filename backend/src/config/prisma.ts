import { env } from './env.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/client/client.js';

const adapter = new PrismaMariaDb({
    host: env.database.host,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    connectionLimit: 10,
    connectTimeout: 30000,
});
const prisma = new PrismaClient({ adapter });

export default prisma;
