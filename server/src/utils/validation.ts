import path from 'path';

const SAFE_TOKEN_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SAFE_PATH_PATTERN = /^[a-zA-Z0-9 ._-]+$/;
const SAFE_FILE_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isSafeToken(value: unknown): value is string {
  return isNonEmptyString(value) && SAFE_TOKEN_PATTERN.test(value.trim());
}

export function isSafePathSegment(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  const trimmed = value.trim();
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) return false;
  return SAFE_PATH_PATTERN.test(trimmed);
}

export function isSafeFileName(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  const trimmed = value.trim();
  if (!SAFE_FILE_PATTERN.test(trimmed)) return false;
  return path.basename(trimmed) === trimmed;
}

export function parsePositiveInt(value: unknown): number | null {
  const numberValue = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 0) return null;
  return numberValue;
}
