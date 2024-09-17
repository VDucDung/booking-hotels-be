import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/constants/auth.constants';
import { ERole } from 'src/enums/roles.enum';

export const AuthDecorator = (specs: ERole[]) => SetMetadata(ROLES, specs);
