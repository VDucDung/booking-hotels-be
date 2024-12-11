import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LocalesModule } from '../locales/locales.module';
import { EmailModule } from '../email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { JWT } from 'src/constants';
import { Role } from '../roles/entities/role.entity';
import { UploadModule } from '../uploads/upload.module';
import { AuthProviderModule } from '../auth_provider/authProvider.module';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';

@Module({
  imports: [
    LocalesModule,
    EmailModule,
    UploadModule,
    forwardRef(() => TransactionsModule),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Role]),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => AuthProviderModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
