import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import type { SignOptions } from 'jsonwebtoken';
import { User } from '@/entities/user.entity';

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  tokenVersion: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly db: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (
      user.mustChangePassword &&
      (!user.temporaryPasswordExpiresAt ||
        user.temporaryPasswordExpiresAt.getTime() <= Date.now())
    )
      throw new UnauthorizedException(
        'Temporary password expired. Ask an administrator to reset it.',
      );
    let isPasswordValid = false;
    try {
      isPasswordValid = await argon2.verify(user.password, password);
    } catch {
      return null;
    }

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async signTokens(user: User): Promise<Tokens> {
    const payload: TokenPayload = {
      sub: user.id.toString(),
      tokenVersion: user.tokenVersion,
      email: user.email,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as SignOptions['expiresIn'],
      }),
    ]);

    // Store hashed refresh token
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userRepo.update(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.userRepo.findOne({
        where: { id: parseInt(payload.sub) },
      });

      if (
        !user ||
        !user.isActive ||
        user.tokenVersion !== payload.tokenVersion ||
        !user.refreshToken ||
        (user.mustChangePassword &&
          (!user.temporaryPasswordExpiresAt ||
            user.temporaryPasswordExpiresAt.getTime() <= Date.now()))
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await argon2.verify(
        user.refreshToken,
        refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.signTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.db.query(
      'UPDATE users SET refresh_token=NULL, token_version=token_version+1 WHERE id=$1',
      [userId],
    );
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    await this.db.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user || !(await argon2.verify(user.password, currentPassword)))
        throw new UnauthorizedException('Current password is incorrect');
      if (currentPassword === newPassword)
        throw new UnauthorizedException('Choose a different password');
      await manager.update(User, id, {
        password: await argon2.hash(newPassword),
        mustChangePassword: false,
        temporaryPasswordExpiresAt: null,
        tokenVersion: user.tokenVersion + 1,
      });
      await manager.query('UPDATE users SET refresh_token=NULL WHERE id=$1', [
        id,
      ]);
      await manager.query(
        'INSERT INTO account_action_audit(actor_id,target_id,action) VALUES($1,$1,$2)',
        [id, 'password_change'],
      );
    });
    return { message: 'Password changed. Sign in with your new password.' };
  }

  buildUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      canManageAccounts: user.canManageAccounts,
    };
  }
}
