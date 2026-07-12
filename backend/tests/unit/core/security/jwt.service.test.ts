import { Role } from 'shared/enums/role.enum.js';
import { describe, it, expect, vi } from 'vitest';

import { JwtService } from '../../../../src/core/security/jwt.service.js';

vi.mock('../../../../src/config/index.js', () => ({
  Config: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h',
  },
}));

describe('JwtService', () => {
  const jwtService = new JwtService();
  const payload = { userId: '123', email: 'test@test.com', role: Role.Employee };

  it('should sign a token', () => {
    const token = jwtService.sign(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should verify a valid token', () => {
    const token = jwtService.sign(payload);
    const decoded = jwtService.verify(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });
});
