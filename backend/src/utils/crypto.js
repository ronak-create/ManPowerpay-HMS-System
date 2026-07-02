import crypto from 'crypto';

// Application-level encryption for sensitive PII (Aadhaar, PAN, bank account).
// Format: "enc:v1:<base64(iv | authTag | ciphertext)>".
//
// Activation: set ENCRYPTION_KEY (64 hex chars = 32 bytes, e.g.
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// ). When the key is absent, encrypt/decrypt pass values through unchanged so the
// app keeps working and existing plaintext rows are never corrupted — encryption
// simply stays dormant until the key is provided.

const PREFIX = 'enc:v1:';
export const SENSITIVE_FIELDS = new Set(['aadhaarNo', 'pan', 'bankAccountNo']);

let warned = false;
function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    if (!warned) {
      console.warn('[crypto] ENCRYPTION_KEY not set — PII encryption is DORMANT (values stored as plaintext).');
      warned = true;
    }
    return null;
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters).');
  return key;
}

export function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === '') return plaintext;
  if (typeof plaintext === 'string' && plaintext.startsWith(PREFIX)) return plaintext; // already encrypted
  const key = getKey();
  if (!key) return plaintext; // dormant
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString('base64');
}

export function decrypt(value) {
  if (typeof value !== 'string' || !value.startsWith(PREFIX)) return value; // plaintext / not encrypted
  const key = getKey();
  if (!key) return value;
  try {
    const buf = Buffer.from(value.slice(PREFIX.length), 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  } catch {
    return value; // don't crash reads on a bad/legacy value
  }
}

// Recursively encrypt sensitive fields inside a Prisma write payload (data/create/update).
export function encryptWritePayload(node) {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(encryptWritePayload);
  for (const key of Object.keys(node)) {
    const val = node[key];
    if (SENSITIVE_FIELDS.has(key) && (typeof val === 'string' || val === null)) {
      node[key] = encrypt(val);
    } else if (val && typeof val === 'object') {
      encryptWritePayload(val);
    }
  }
  return node;
}
