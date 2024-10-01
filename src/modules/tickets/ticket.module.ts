import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket } from './entities/ticket.entity';
import { LocalesModule } from '../locales/locales.module';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    LocalesModule,
    RoomModule,
    UserModule,
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}