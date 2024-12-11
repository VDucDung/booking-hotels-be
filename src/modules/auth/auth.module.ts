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
import { LocalesModule } from '../locales/locales.module';
import { AuthProviderModule } from '../auth_provider/authProvider.module';
import { RoleModule } from '../roles/role.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthProviderModule),
    CryptoModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    TypeOrmModule.forFeature([User]),
    EmailModule,
    LocalesModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
