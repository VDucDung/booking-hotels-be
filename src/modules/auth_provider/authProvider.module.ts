import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthProvider } from './entities/auth_provider.entity';
import { AuthProviderService } from './authProvider.service';
import { AuthProviderController } from './authProvider.controller';
import { UserModule } from '../users/user.module';
import { LocalesModule } from '../locales/locales.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthProvider]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => LocalesModule),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  providers: [AuthProviderService],
  controllers: [AuthProviderController],
  exports: [AuthProviderService],
})
export class AuthProviderModule {}
