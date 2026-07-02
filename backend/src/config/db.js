import { PrismaClient, Prisma } from '@prisma/client';
import { decrypt, encryptWritePayload, SENSITIVE_FIELDS } from '../utils/crypto.js';

// Post-process query results: money Decimal columns are stored as Postgres NUMERIC
// for exact arithmetic but the codebase does plain JS number math, so we convert
// Decimal -> Number; and sensitive PII fields are decrypted transparently (this
// also covers nested `include`d relations). Writes accept numbers as-is.
function transformResult(value) {
  if (value === null || value === undefined) return value;
  if (Prisma.Decimal.isDecimal(value)) return value.toNumber();
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return value.map(transformResult);
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      const v = value[key];
      out[key] = SENSITIVE_FIELDS.has(key) && typeof v === 'string' ? decrypt(v) : transformResult(v);
    }
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
        // Encrypt sensitive PII in write payloads before it hits the database.
        if (args && typeof args === 'object') {
          for (const key of ['data', 'create', 'update']) {
            if (args[key]) encryptWritePayload(args[key]);
          }
        }
        return transformResult(await query(args));
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
