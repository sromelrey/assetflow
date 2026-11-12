import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';

export interface JwtPayload {
  sub: number;
  tokenVersion: number;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub, deletedAt: undefined },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (payload.tokenVersion !== user.tokenVersion)
      throw new UnauthorizedException('Session expired. Sign in again.');
    if (
      user.mustChangePassword &&
      (!user.temporaryPasswordExpiresAt ||
        user.temporaryPasswordExpiresAt.getTime() <= Date.now())
    )
      throw new UnauthorizedException('Temporary password expired');
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

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
