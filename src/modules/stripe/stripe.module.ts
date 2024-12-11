import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { LocalesModule } from '../locales/locales.module';
import { UserModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';
import { TicketModule } from '../tickets/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LocalesModule,
    UserModule,
    TransactionsModule,
    TicketModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
