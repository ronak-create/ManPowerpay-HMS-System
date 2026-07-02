import { PrismaClient, Prisma } from '@prisma/client';
import { decrypt, encryptWritePayload, SENSITIVE_FIELDS } from '../utils/crypto.js';
import { getCompanyId, isBypassed } from '../lib/tenantContext.js';

// Models that carry a companyId and must be scoped to the current tenant. Company
// itself is scoped by its own id. Global/relation-scoped models are excluded
// (Plan, PaymentEvent, SalaryComponent [via template], EmployeeDocument [via
// employee], OtpToken [pre-auth by email]).
const TENANT_MODELS = new Set([
  'Company', 'User', 'Employee', 'Attendance', 'LeaveRequest', 'LeaveBalance',
  'PayrollRun', 'Payslip', 'AdvanceLoan', 'AuditLog', 'Notification', 'Resignation',
  'Form16', 'Holiday', 'PtSlab', 'Department', 'Site', 'SalaryTemplate', 'Subscription',
]);

// Merge the tenant filter into a query's args based on the operation type.
function scopeArgs(model, operation, args, companyId) {
  const field = model === 'Company' ? 'id' : 'companyId';
  const a = args ? { ...args } : {};
  const withTenantWhere = () => { a.where = { ...(a.where || {}), [field]: companyId }; };

  switch (operation) {
    case 'findUnique':
    case 'findUniqueOrThrow':
    case 'findFirst':
    case 'findFirstOrThrow':
    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
    case 'update':
    case 'updateMany':
    case 'delete':
    case 'deleteMany':
      withTenantWhere();
      break;
    case 'create':
      a.data = { ...a.data, [field]: companyId };
      break;
    case 'createMany':
      a.data = Array.isArray(a.data)
        ? a.data.map((d) => ({ ...d, [field]: companyId }))
        : { ...a.data, [field]: companyId };
      break;
    case 'upsert':
      withTenantWhere();
      a.create = { ...(a.create || {}), [field]: companyId };
      break;
    default:
      break;
  }
  return a;
}

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
      async $allOperations({ model, operation, query, args }) {
        // Scope to the current tenant (skipped when there's no request context —
        // auth, signup, seed, webhooks — or when explicitly bypassed).
        const companyId = getCompanyId();
        if (companyId && !isBypassed() && TENANT_MODELS.has(model)) {
          args = scopeArgs(model, operation, args, companyId);
        }
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
