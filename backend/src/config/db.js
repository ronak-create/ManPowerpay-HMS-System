import { PrismaClient, Prisma } from '@prisma/client';

// Money columns are stored as Postgres NUMERIC for exact arithmetic, which Prisma
// returns as Decimal objects. The rest of the codebase does plain JS number math,
// so we convert Decimal -> Number on the way out of every query. Writes are
// unaffected (Prisma accepts JS numbers for Decimal columns).
function decimalsToNumbers(value) {
  if (value === null || value === undefined) return value;
  if (Prisma.Decimal.isDecimal(value)) return value.toNumber();
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return value.map(decimalsToNumbers);
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = decimalsToNumbers(value[key]);
    return out;
  }
  return value;
}

const prisma = new PrismaClient({
  log: ['warn', 'error'],
}).$extends({
  query: {
    $allModels: {
      async $allOperations({ query, args }) {
        return decimalsToNumbers(await query(args));
      },
    },
  },
});

// Close the pool cleanly on shutdown so connections aren't leaked on redeploy.
const shutdown = async () => {
  await prisma.$disconnect();
};
process.on('beforeExit', shutdown);
process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });

export default prisma;
