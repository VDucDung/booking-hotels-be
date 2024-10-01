import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from 'src/modules/users/entities/user.entity';

export const UserDecorator = createParamDecorator(
  (data: keyof UserEntity, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserEntity;
    return data ? user?.[data] : user;
  },
);
