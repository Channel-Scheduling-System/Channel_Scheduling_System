import { env } from './env.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/client/client.js';

let adapter;

if (env.database.url) {
    console.log('Utilizando variables del entorno de producción');
    const databaseUrl = new URL(env.database.url);
    
    adapter = new PrismaMariaDb({
        host: databaseUrl.hostname,
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database: databaseUrl.pathname.replace(/^\//, ''),
        port: databaseUrl.port ? Number(databaseUrl.port) : 3306,
        connectionLimit: 10,
        connectTimeout: 30000,
    });
    
} else {
    console.log('Utilizando variables del entorno local');
    adapter = new PrismaMariaDb({
        host: env.database.host,
        port: env.database.port,
        user: env.database.user,
        password: env.database.password,
        database: env.database.name,
        connectionLimit: 10,
        connectTimeout: 30000,
    });
}

const prisma = new PrismaClient({ adapter });

export default prisma;