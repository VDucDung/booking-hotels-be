import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeRoom } from './entities/type_room.entity';
import { TypeRoomController } from './typeRoom.controller';
import { TypeRoomService } from './typeRoom.service';
import { LocalesModule } from '../locales/locales.module';
import { HotelModule } from '../hotels/hotel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeRoom]),
    LocalesModule,
    forwardRef(() => HotelModule),
  ],
  controllers: [TypeRoomController],
  providers: [TypeRoomService],
  exports: [TypeRoomService],
})
export class TypeRoomModule {}
