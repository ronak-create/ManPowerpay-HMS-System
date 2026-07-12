import { describe, it, expect, afterEach } from 'vitest';
import { getRetentionDays, DEFAULT_RETENTION_DAYS } from '../src/lib/auditRetention.js';

const ORIGINAL = process.env.AUDIT_LOG_RETENTION_DAYS;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.AUDIT_LOG_RETENTION_DAYS;
  else process.env.AUDIT_LOG_RETENTION_DAYS = ORIGINAL;
});

describe('audit retention window', () => {
  it('defaults to DEFAULT_RETENTION_DAYS when unset', () => {
    delete process.env.AUDIT_LOG_RETENTION_DAYS;
    expect(getRetentionDays()).toBe(DEFAULT_RETENTION_DAYS);
  });

  it('reads a numeric override from the env', () => {
    process.env.AUDIT_LOG_RETENTION_DAYS = '90';
    expect(getRetentionDays()).toBe(90);
  });

  it('treats 0 as "pruning disabled" (kept, not defaulted)', () => {
    process.env.AUDIT_LOG_RETENTION_DAYS = '0';
    expect(getRetentionDays()).toBe(0);
  });

  it('falls back to the default for non-numeric values', () => {
    process.env.AUDIT_LOG_RETENTION_DAYS = 'forever';
    expect(getRetentionDays()).toBe(DEFAULT_RETENTION_DAYS);
  });

  it('falls back to the default for an empty string', () => {
    process.env.AUDIT_LOG_RETENTION_DAYS = '';
    expect(getRetentionDays()).toBe(DEFAULT_RETENTION_DAYS);
  });
});
