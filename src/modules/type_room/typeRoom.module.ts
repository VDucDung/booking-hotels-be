import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeRoom } from './entities/type_room.entity';
import { TypeRoomController } from './typeRoom.controller';
import { TypeRoomService } from './typeRoom.service';
import { LocalesModule } from '../locales/locales.module';
import { HotelModule } from '../hotels/hotel.module';
import { UserModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { Room } from '../room/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeRoom, Room]),
    LocalesModule,
    forwardRef(() => HotelModule),
    LocalesModule,
    UserModule,
    forwardRef(() => HotelModule),
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [TypeRoomController],
  providers: [TypeRoomService],
  exports: [TypeRoomService],
})
export class TypeRoomModule {}
