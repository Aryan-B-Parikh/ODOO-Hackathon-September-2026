import { describe, it, expect } from 'vitest';

import { PasswordService } from '../../../../src/core/security/password.service';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  it('should hash a password differently than the plaintext', async () => {
    const plain = 'secret123';
    const hashed = await passwordService.hash(plain);
    expect(hashed).not.toBe(plain);
    expect(hashed.length).toBeGreaterThan(0);
  });

  it('should verify a correct password', async () => {
    const plain = 'secret123';
    const hashed = await passwordService.hash(plain);
    const isValid = await passwordService.compare(plain, hashed);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const plain = 'secret123';
    const hashed = await passwordService.hash(plain);
    const isValid = await passwordService.compare('wrong', hashed);
    expect(isValid).toBe(false);
  });
});
