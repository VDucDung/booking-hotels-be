// auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { CryptoModule } from '../crypto/crypto.module';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { JWT } from 'src/constants';
import { PermissionsModule } from '../permissions/permissions.module';
import { LocalesModule } from '../locales/locales.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => PermissionsModule),
    CryptoModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    TypeOrmModule.forFeature([User]),
    EmailModule,
    LocalesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
