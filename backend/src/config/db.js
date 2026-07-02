import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['warn', 'error'],
});

// Close the pool cleanly on shutdown so connections aren't leaked on redeploy.
const shutdown = async () => {
  await prisma.$disconnect();
};
process.on('beforeExit', shutdown);
process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });

export default prisma;
