import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { LocalesModule } from '../locales/locales.module';
import { UserModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PermissionsModule,
    LocalesModule,
    UserModule,
    TransactionsModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [StripeController, WebhookController],
  providers: [StripeService],
})
export class StripeModule {}
