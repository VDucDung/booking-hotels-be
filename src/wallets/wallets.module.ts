import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { UserModule } from 'src/modules/users/user.module';
import { PermissionsModule } from 'src/modules/permissions/permissions.module';
import { LocalesModule } from 'src/modules/locales/locales.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';

@Module({
  imports: [
    TransactionsModule,
    UserModule,
    PermissionsModule,
    LocalesModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
