import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { UserModule } from './modules/users/user.module';
import { LocalesModule } from './modules/locales/locales.module';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/roles/role.module';
import { UploadModule } from './modules/uploads/upload.module';
import { HotelModule } from './modules/hotels/hotel.module';
import { RoomModule } from './modules/room/room.module';
import { TicketModule } from './modules/tickets/ticket.module';
import { TypeRoomModule } from './modules/type_room/typeRoom.module';
import { FavoriteModule } from './modules/favorites/favorite.module';
import { ReviewModule } from './modules/review/review.module';
import { AuthProviderModule } from './modules/auth_provider/authProvider.module';
import { CategoryModule } from './modules/category/category.module';
import { UtilityModule } from './modules/utilities/utility.module';
import { TypeUtilityModule } from './modules/type_utility/type_utility.module';
import { ReviewReplyModule } from './modules/review_reply/review_reply.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramService } from './modules/telegram/telegram.service';
import { CronService } from './modules/cron/cron.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'en']),
        new HeaderResolver(['x-lang']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
    }),
    UserModule,
    AuthModule,
    LocalesModule,
    RabbitMQModule,
    EmailModule,
    RoleModule,
    UploadModule,
    HotelModule,
    RoomModule,
    TicketModule,
    TypeRoomModule,
    FavoriteModule,
    ReviewModule,
    AuthProviderModule,
    CategoryModule,
    TypeUtilityModule,
    UtilityModule,
    ReviewReplyModule,
    StripeModule,
    TransactionsModule,
    WalletsModule,
    DashboardModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, TelegramService, CronService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
