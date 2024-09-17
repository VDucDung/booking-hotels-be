import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LocalesModule } from '../locales/locales.module';
import { EmailModule } from '../email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { JWT } from 'src/constants';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [
    LocalesModule,
    EmailModule,
    forwardRef(() => PermissionsModule),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Role]),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}