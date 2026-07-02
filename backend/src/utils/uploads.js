import path from 'path';
import ApiError from './ApiError.js';

// Allowed content types per upload kind. Extension is checked too so a mislabelled
// content-type can't sneak an executable through.
const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const DOC_MIME = [...IMAGE_MIME, 'application/pdf'];
const DOC_EXT = [...IMAGE_EXT, '.pdf'];

function makeFilter(allowedMime, allowedExt, label) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
      return cb(null, true);
    }
    cb(new ApiError(400, `Invalid file type. Allowed: ${label}.`));
  };
}

export const imageFileFilter = makeFilter(IMAGE_MIME, IMAGE_EXT, 'JPG, PNG, WEBP');
export const documentFileFilter = makeFilter(DOC_MIME, DOC_EXT, 'PDF, JPG, PNG, WEBP');

// Spreadsheet uploads used by bulk import (xlsx/xls/csv).
const SHEET_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/octet-stream', // some browsers send this for .xlsx
];
const SHEET_EXT = ['.xlsx', '.xls', '.csv'];
export const spreadsheetFileFilter = makeFilter(SHEET_MIME, SHEET_EXT, 'XLSX, XLS, CSV');

/**
 * Guard against path traversal: resolve `filePath` and confirm it stays within
 * `baseDir`. Returns the resolved absolute path, or throws a 400.
 */
export function assertPathWithin(baseDir, filePath) {
  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(filePath);
  if (resolved !== resolvedBase && !resolved.startsWith(resolvedBase + path.sep)) {
    throw new ApiError(400, 'Invalid file path');
  }
  return resolved;
}
