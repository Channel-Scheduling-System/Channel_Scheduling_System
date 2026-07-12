import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/client/client.js';
import { env } from './env.js';

function createPgAdapter(): PrismaPg {
    const databaseUrl = new URL(env.databaseUrl);
    return new PrismaPg({
        connectionString: databaseUrl.toString(),
    });
}

const prisma = new PrismaClient({
    adapter: createPgAdapter(),
});

export default prisma;
