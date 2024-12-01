import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TicketModule } from '../tickets/ticket.module';
import { LocalesModule } from '../locales/locales.module';
import { UploadModule } from '../uploads/upload.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT } from 'src/constants';
import { HotelModule } from '../hotels/hotel.module';
import { TypeRoomModule } from '../type_room/typeRoom.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    TicketModule,
    LocalesModule,
    UploadModule,
    PermissionsModule,
    UserModule,
    HotelModule,
    TypeRoomModule,
    RoomModule,
    JwtModule.register({
      secret: JWT.secretAccess,
      signOptions: { expiresIn: JWT.expiresAccessToken },
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
