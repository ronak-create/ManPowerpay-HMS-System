import fs from 'fs/promises';
import path from 'path';

// File storage abstraction. Render's disk is ephemeral, so in production files
// must live in Supabase Storage. Driver is chosen by env:
//   - Supabase  when SUPABASE_URL + SUPABASE_SERVICE_KEY are set
//   - local     otherwise (dev / current behavior)
//
// Keys are bucket-relative POSIX paths, e.g. "payslips/EMP001_6_2026.pdf".
// Controllers persist the returned key and read back a Buffer via getBuffer().

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'manpowerpay';
const LOCAL_ROOT = path.resolve(process.cwd(), 'uploads');

export const usingSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

function normalizeKey(key) {
  // Strip any leading "uploads/" and normalize separators so legacy disk paths
  // (e.g. "uploads/payslips/x.pdf" or "uploads\\logos\\y.png") map to a clean key.
  return String(key).replace(/\\/g, '/').replace(/^\/?uploads\//, '').replace(/^\/+/, '');
}

// ---- Supabase (REST) ----
async function sbUpload(key, buffer, contentType) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Storage upload failed (${res.status}): ${await res.text()}`);
}

async function sbDownload(key) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`, {
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Storage download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

// ---- Local disk ----
async function localSave(key, buffer) {
  const full = path.join(LOCAL_ROOT, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buffer);
}
async function localRead(key) {
  const full = path.join(LOCAL_ROOT, key);
  try { return await fs.readFile(full); } catch { return null; }
}

// ---- Public API ----
export async function saveFile(key, buffer, contentType) {
  const k = normalizeKey(key);
  if (usingSupabase) await sbUpload(k, buffer, contentType);
  else await localSave(k, buffer);
  return k;
}

export async function getBuffer(key) {
  const k = normalizeKey(key);
  return usingSupabase ? sbDownload(k) : localRead(k);
}

export async function fileExists(key) {
  return (await getBuffer(key)) !== null;
}
