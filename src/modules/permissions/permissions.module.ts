import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { LocalesModule } from '../locales/locales.module';
import { UserModule } from '../users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';

@Module({
  imports: [
    LocalesModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Permission]),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
