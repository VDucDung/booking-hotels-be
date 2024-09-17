import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT, PERMISSIONS, ROLES } from 'src/constants';
import { AUTH_MESSAGE, USER_MESSAGE } from 'src/messages';
import { LocalesService } from 'src/modules/locales/locales.service';
import { PermissionsService } from 'src/modules/permissions/permissions.service';
import { UserService } from 'src/modules/users/user.service';
import { ErrorHelper } from '../helpers';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PermissionsService))
    private readonly permissionsService: PermissionsService,
    @Inject(forwardRef(() => LocalesService))
    private readonly localesService: LocalesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES, context.getHandler());
    const permission = this.reflector.get<string>(
      PERMISSIONS,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: JWT.secretAccess,
      });
    } catch (err) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.TOKEN_INVALID),
      );
    }
    let user;
    try {
      user = await this.userService.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });
      if (!user || !user.role) {
        ErrorHelper.UnauthorizedException(
          this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
        );
      }
    } catch (error) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }
    if (roles && roles.length > 0 && !roles.includes(user.role.name)) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    if (permission) {
      const checkPermission = await this.permissionsService.findOne({
        where: { slug: permission },
      });

      if (checkPermission && !user.permissionIds.includes(checkPermission.id)) {
        ErrorHelper.UnauthorizedException(
          this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
        );
      }
    }

    (request as any).user = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
