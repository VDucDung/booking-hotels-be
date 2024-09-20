import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserService } from '../users/user.service';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { ROOM_MESSAGE, TICKET_MESSAGE, USER_MESSAGE } from 'src/messages';
import { RoomService } from '../room/room.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly userService: UserService,
    private readonly localesService: LocalesService,
    private readonly roomService: RoomService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { userId, roomId } = createTicketDto;

    const user = await this.userService.findOne(userId);
    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }

    const room = await this.roomService.findOne(+roomId);
    if (!room) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(ROOM_MESSAGE.ROOM_NOT_FOUND),
      );
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
    });

    await this.ticketRepository.save(ticket);
    return ticket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({ relations: ['user', 'room'] });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['user', 'room'],
    });
    if (!ticket) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TICKET_MESSAGE.TICKET_NOT_FOUND),
      );
    }
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.preload({
      id,
      ...updateTicketDto,
    });

    if (!ticket) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TICKET_MESSAGE.TICKET_NOT_FOUND),
      );
    }

    return this.ticketRepository.save(ticket);
  }

  async remove(id: string): Promise<boolean> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
    return true;
  }
}
