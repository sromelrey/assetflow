import { Controller, Get, Post, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import request = require('supertest');
import { User } from '@/entities/user.entity';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { JwtStrategy } from './providers/jwt.strategy';

@Controller('business')
class BusinessController {
  @Get() read() {
    return { ok: true };
  }
}
@Controller('auth')
class AuthController {
  @Get('me') getProfile() {
    return { ok: true };
  }
  @Post('change-password') changePassword() {
    return { ok: true };
  }
}
describe('Global API session guard', () => {
  let app: INestApplication;
  const secret = 'release-test-secret-only';
  const jwt = new JwtService({ secret });
  let user: Record<string, unknown>;
  const token = (version = 0) =>
    jwt.sign(
      {
        sub: 1,
        email: 'test@example.com',
        name: 'Test',
        tokenVersion: version,
      },
      { expiresIn: '1h' },
    );
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BusinessController, AuthController],
      providers: [
        JwtStrategy,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: ConfigService, useValue: { getOrThrow: () => secret } },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: async () => user },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  beforeEach(() => {
    user = {
      id: 1,
      isActive: true,
      tokenVersion: 0,
      mustChangePassword: false,
    };
  });
  afterAll(async () => {
    await app?.close();
  });
  it('requires authentication on business routes', async () => {
    await request(app.getHttpServer()).get('/business').expect(401);
  });
  it('allows a valid active account', async () => {
    await request(app.getHttpServer())
      .get('/business')
      .auth(token(), { type: 'bearer' })
      .expect(200);
  });
  it('restricts temporary-password sessions to password change/profile', async () => {
    user.mustChangePassword = true;
    user.temporaryPasswordExpiresAt = new Date(Date.now() + 60000);
    await request(app.getHttpServer())
      .get('/business')
      .auth(token(), { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .get('/auth/me')
      .auth(token(), { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/change-password')
      .auth(token(), { type: 'bearer' })
      .expect(201);
  });
  it('rejects old and unversioned tokens after reset', async () => {
    user.tokenVersion = 1;
    await request(app.getHttpServer())
      .get('/business')
      .auth(token(), { type: 'bearer' })
      .expect(401);
    const legacy = jwt.sign({ sub: 1 });
    await request(app.getHttpServer())
      .get('/business')
      .auth(legacy, { type: 'bearer' })
      .expect(401);
  });
});
