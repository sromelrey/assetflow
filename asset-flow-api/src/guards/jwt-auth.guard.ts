import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    if (
      (controller === 'AuthController' &&
        ['login', 'refresh'].includes(handler)) ||
      controller === 'HealthController'
    )
      return true;
    await super.canActivate(context);
    const user = context.switchToHttp().getRequest().user;
    if (
      user?.mustChangePassword &&
      !(
        controller === 'AuthController' &&
        ['changePassword', 'getProfile', 'logout'].includes(handler)
      )
    )
      throw new ForbiddenException(
        'Change your temporary password before continuing',
      );
    return true;
  }
  handleRequest(err: any, user: any): any {
    if (err || !user)
      throw err || new UnauthorizedException('Invalid or expired token');
    return user;
  }
}
