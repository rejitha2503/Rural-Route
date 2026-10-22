import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAndNormalizeIndianPhone } from './phoneValidation.ts';

test('validates standard 10-digit Indian phone number', () => {
  const result = validateAndNormalizeIndianPhone('9842154321');
  assert.equal(result.isValid, true);
  assert.equal(result.normalized, '+919842154321');
  assert.equal(result.rawDigits, '9842154321');
  assert.equal(result.formatted, '+91 98421 54321');
});

test('normalizes phone with +91 country code and spaces', () => {
  const result = validateAndNormalizeIndianPhone('+91 98421 54321');
  assert.equal(result.isValid, true);
  assert.equal(result.normalized, '+919842154321');
});

test('normalizes phone with leading zero', () => {
  const result = validateAndNormalizeIndianPhone('09786012345');
  assert.equal(result.isValid, true);
  assert.equal(result.normalized, '+919786012345');
});

test('normalizes phone with 91 prefix without plus', () => {
  const result = validateAndNormalizeIndianPhone('918870123456');
  assert.equal(result.isValid, true);
  assert.equal(result.normalized, '+918870123456');
});

test('rejects phone not starting with 6, 7, 8, or 9', () => {
  const result = validateAndNormalizeIndianPhone('5123456789');
  assert.equal(result.isValid, false);
  assert.match(result.errorEn || '', /start with 6, 7, 8, or 9/);
});

test('rejects numbers with fewer than 10 digits', () => {
  const result = validateAndNormalizeIndianPhone('9842154');
  assert.equal(result.isValid, false);
});

test('rejects non-numeric characters', () => {
  const result = validateAndNormalizeIndianPhone('98421abcde');
  assert.equal(result.isValid, false);
});
