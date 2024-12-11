import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { Hotel } from './entities/hotel.entity';
import { LocalesModule } from '../locales/locales.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { UserModule } from '../users/user.module';
import { UploadModule } from '../uploads/upload.module';
import { TypeRoomModule } from '../type_room/typeRoom.module';
import { FavoriteModule } from '../favorites/favorite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel]),
    LocalesModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
    UserModule,
    UploadModule,
    forwardRef(() => TypeRoomModule),
    forwardRef(() => FavoriteModule),
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
