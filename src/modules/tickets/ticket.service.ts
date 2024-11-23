import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserService } from '../users/user.service';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import {
  AUTH_MESSAGE,
  ROOM_MESSAGE,
  TICKET_MESSAGE,
  USER_MESSAGE,
} from 'src/messages';
import { RoomService } from '../room/room.service';
import { User } from '../users/entities/user.entity';
import { ERole } from 'src/enums/roles.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly userService: UserService,
    private readonly localesService: LocalesService,
    private readonly roomService: RoomService,
  ) {}

  async create(
    userId: number,
    createTicketDto: CreateTicketDto,
  ): Promise<Ticket> {
    const { roomId } = createTicketDto;

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }

    const room = await this.roomService.findOne(roomId);
    if (!room) {
      throw new Error(
        this.localesService.translate(ROOM_MESSAGE.ROOM_NOT_FOUND),
      );
    }

    this.roomService.updateBookingDate(room.id, new Date());

    createTicketDto.checkInDate = new Date(
      createTicketDto.checkInDate,
    ).toISOString();
    createTicketDto.checkOutDate = new Date(
      createTicketDto.checkOutDate,
    ).toISOString();

    const ticket = this.ticketRepository.create({
      user,
      room,
      status: 'pending',
      ...createTicketDto,
    });

    await this.ticketRepository.save(ticket);
    delete ticket.user;
    delete ticket.room;
    return ticket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({ relations: ['user', 'room'] });
  }

  async findTicketByUserId(userId: number): Promise<Ticket[]> {
    const user = await this.userService.getUserById(userId);

    const ticket = await this.ticketRepository.find({
      where: { user: { id: user.id } },
      relations: [
        'room',
        'room.typeRoomId',
        'room.typeRoomId.hotel',
        'room.typeRoomId.hotel.reviews',
      ],
      select: {
        room: {
          id: true,
          bookingDate: true,
          capacity: true,
          description: true,
          images: true,
          price: true,
          options: true,
          roomName: true,
          typeRoomId: {
            id: true,
            hotel: {
              id: true,
              address: true,
              hotelName: true,
              description: true,
              favorites: true,
              images: true,
              reviews: true,
            },
          },
        },
      },
    });

    if (!ticket) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TICKET_MESSAGE.TICKET_NOT_FOUND),
      );
    }

    return ticket;
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

  async update(
    id: string,
    user: User,
    updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);
    if (!ticket) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(TICKET_MESSAGE.TICKET_NOT_FOUND),
      );
    }
    console.log(ticket.user.id, user.id);

    if (ticket.user.id !== user.id && user.role.name !== ERole.ADMIN) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    if (updateTicketDto.checkInDate) {
      updateTicketDto.checkInDate = new Date(
        updateTicketDto.checkInDate,
      ).toISOString();
    }

    if (updateTicketDto.checkOutDate) {
      updateTicketDto.checkOutDate = new Date(
        updateTicketDto.checkOutDate,
      ).toISOString();
    }

    const updatedTicket = await this.ticketRepository.preload({
      id: ticket.id,
      ...updateTicketDto,
    });

    if (!updatedTicket) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TICKET_MESSAGE.UPDATE_TICKET_FAIL),
      );
    }

    // Lưu lại ticket đã được cập nhật
    return this.ticketRepository.save(updatedTicket);
  }

  async remove(id: string, user: User): Promise<void> {
    const ticket = await this.findOne(id);
    if (ticket.user.id !== user.id && user.role.name !== ERole.ADMIN) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    await this.ticketRepository.remove(ticket);
  }
}
