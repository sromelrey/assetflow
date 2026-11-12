import { AuthService } from './providers/auth.service';
import { JwtStrategy } from './providers/jwt.strategy';
import { AccountManagementGuard } from '@/guards/account-management.guard';
import { safeUser, UserService } from '@/modules/user/user.service';
import * as argon2 from 'argon2';

describe('Account security contracts', () => {
  it('resets credentials atomically without activating an inactive account', async () => {
    let saved: Record<string, unknown> = {};
    const manager = {
      findOne: async () => ({ id: 2, tokenVersion: 7, isActive: false }),
      update: jest.fn(
        async (
          _entity: unknown,
          _id: number,
          fields: Record<string, unknown>,
        ) => {
          saved = fields;
        },
      ),
      query: jest.fn(async () => []),
    };
    const db = {
      transaction: async (run: (m: typeof manager) => Promise<unknown>) =>
        run(manager),
    };
    const service = new UserService({} as any, db as any);
    const result = await service.resetPassword(2, 1);
    expect(
      await argon2.verify(saved.password as string, result.temporaryPassword),
    ).toBe(true);
    expect(saved).toMatchObject({ tokenVersion: 8, mustChangePassword: true });
    expect(saved).not.toHaveProperty('isActive');
    expect(manager.query).toHaveBeenCalledWith(
      'UPDATE users SET refresh_token=NULL WHERE id=$1',
      [2],
    );
    await expect(service.resetPassword(1, 1)).rejects.toThrow('own account');
  });
  it('does not expose credential fields', () => {
    expect(
      safeUser({
        id: 1,
        password: 'secret',
        refreshToken: 'secret',
        tokenVersion: 5,
      } as any),
    ).not.toHaveProperty('password');
    expect(
      safeUser({ id: 1, password: 'secret', refreshToken: 'secret' } as any),
    ).not.toHaveProperty('refreshToken');
  });
  it('denies operators without the explicit permission', () => {
    const guard = new AccountManagementGuard();
    const context = (user: any) =>
      ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as any;
    expect(() => guard.canActivate(context({}))).toThrow();
    expect(guard.canActivate(context({ canManageAccounts: true }))).toBe(true);
  });
  it('hashes direct-created credentials and never returns the hash', async () => {
    const repo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 1, ...x })),
    };
    const service = new UserService(repo as any, {} as any);
    const result = await service.create({
      name: 'Test',
      email: 'TEST@example.com',
      password: 'temporary-test-only',
    });
    expect(
      await argon2.verify(
        repo.save.mock.calls[0][0].password,
        'temporary-test-only',
      ),
    ).toBe(true);
    expect(result.email).toBe('test@example.com');
    expect(result).not.toHaveProperty('password');
  });
  it('rejects stale JWTs even if their signature is valid', async () => {
    const repo = {
      findOne: jest.fn(async () => ({
        id: 1,
        isActive: true,
        tokenVersion: 3,
      })),
    };
    const strategy = new JwtStrategy(
      { getOrThrow: () => 'test-secret-only' } as any,
      repo as any,
    );
    await expect(
      strategy.validate({
        sub: 1,
        name: 'Test',
        email: 'test@example.com',
        tokenVersion: 2,
      }),
    ).rejects.toThrow('Session expired');
    await expect(
      strategy.validate({
        sub: 1,
        name: 'Test',
        email: 'test@example.com',
        tokenVersion: 3,
      }),
    ).resolves.toMatchObject({ id: 1 });
  });
  it('rejects expired temporary credentials', async () => {
    const repo = {
      findOne: async () => ({
        id: 1,
        isActive: true,
        mustChangePassword: true,
        temporaryPasswordExpiresAt: new Date(0),
      }),
    };
    const auth = new AuthService(repo as any, {} as any, {} as any, {} as any);
    await expect(
      auth.validateUser('test@example.com', 'anything'),
    ).rejects.toThrow('expired');
  });
  it('rejects refresh tokens for inactive accounts', async () => {
    const repo = {
      findOne: async () => ({
        id: 1,
        isActive: false,
        tokenVersion: 0,
        refreshToken: 'irrelevant',
      }),
    };
    const jwt = { verifyAsync: async () => ({ sub: '1', tokenVersion: 0 }) };
    const auth = new AuthService(
      repo as any,
      jwt as any,
      {} as any,
      { getOrThrow: () => 'test' } as any,
    );
    await expect(auth.refreshTokens('test')).rejects.toThrow();
  });
});
