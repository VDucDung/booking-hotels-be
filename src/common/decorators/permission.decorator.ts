import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from 'src/constants/auth.constants';
import { EUserPermission } from 'src/enums/roles.enum';

export const PermissionDecorator = (specs: EUserPermission) =>
  SetMetadata(PERMISSIONS, specs);
