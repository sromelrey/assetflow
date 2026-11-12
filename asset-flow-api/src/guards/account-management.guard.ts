import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
@Injectable()
export class AccountManagementGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (
      !context
        .switchToHttp()
        .getRequest<{ user?: { canManageAccounts?: boolean } }>().user
        ?.canManageAccounts
    )
      throw new ForbiddenException('Account management permission is required');
    return true;
  }
}
