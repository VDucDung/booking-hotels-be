import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { AuthModule } from '../auth/auth.module';
import { LocalesModule } from '../locales/locales.module';
import { UserModule } from '../users/user.module';
import { HotelModule } from '../hotels/hotel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite, User]),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    forwardRef(() => AuthModule),
    LocalesModule,
    UserModule,
    forwardRef(() => HotelModule),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
