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
import { TicketStatus } from 'src/enums/ticket.enum';

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
  ): Promise<Ticket & { partnerId?: number }> {
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
      status: TicketStatus.PENDING,
      ...createTicketDto,
    });

    await this.ticketRepository.save(ticket);

    const ticketResponse = {
      ...ticket,
      partnerId: room.partner.id,
    };

    delete ticketResponse.user;
    delete ticketResponse.room;

    return ticketResponse;
  }

  async updateTicketStatus(
    paymentIntentId: string,
    status: TicketStatus,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!ticket) {
      ErrorHelper.NotFoundException('Ticket not found');
    }

    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }

  async updateTicketStatusById(
    ticketId: string,
    status: TicketStatus,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      ErrorHelper.NotFoundException('Ticket not found');
    }

    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }

  async handleSuccessfulBookingPayment(session: any) {
    const ticket = await this.ticketRepository.findOne({
      where: { stripePaymentIntentId: session.payment_intent },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.status = TicketStatus.PAID;
    await this.ticketRepository.save(ticket);

    const hotelOwnerId = session.metadata.hotelOwnerId;
    const hotelOwnerStripeAccount =
      await this.userService.getUserById(hotelOwnerId);

    hotelOwnerStripeAccount.balance += ticket.amount;
    await this.userService.updateUserById(hotelOwnerId, {
      balance: hotelOwnerStripeAccount.balance,
    });

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

  async findTicketByPartnerId(userId: number): Promise<Ticket[]> {
    const ticket = await this.ticketRepository.find({
      where: { room: { partner: { id: userId } } },
      relations: ['room'],
      select: {
        room: {
          id: true,
          capacity: true,
          description: true,
          images: true,
          roomName: true,
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

  async findByPaymentIntentId(stripePaymentIntentId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { stripePaymentIntentId },
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
      relations: ['user', 'room', 'room.partner'],
    });
    if (!ticket) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TICKET_MESSAGE.TICKET_NOT_FOUND),
      );
    }
    return ticket;
  }

  async update(
    ticketId: string,
    user: User,
    updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(ticketId);
    if (!ticket) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(TICKET_MESSAGE.TICKET_NOT_FOUND),
      );
    }

    if (ticket.room.partner.id !== user.id && ticket.user.id !== user.id) {
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

    return this.ticketRepository.save(updatedTicket);
  }

  async remove(id: string, user: User): Promise<void> {
    const ticket = await this.findOne(id);
    if (ticket.room.partner.id !== user.id && user.role.name !== ERole.ADMIN) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    await this.ticketRepository.remove(ticket);
  }

  async getTotalBookings(user: User): Promise<number> {
    return this.ticketRepository.count({
      where: { room: { partner: { id: user.id } } },
    });
  }

  async getTotalRevenues(user: User): Promise<number> {
    return this.ticketRepository.sum('amount', {
      room: {
        partner: {
          id: user.id,
        },
      },
      status: 'paid',
    });
  }

  async getMonthlyRevenuesAndBookings(user: User): Promise<
    {
      year: number;
      month: number;
      totalBookings: number;
      totalRevenue: number;
    }[]
  > {
    const result = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.room', 'room')
      .innerJoin('room.partner', 'partner')
      .select('EXTRACT(YEAR FROM ticket.createdAt)', 'year')
      .addSelect('EXTRACT(MONTH FROM ticket.createdAt)', 'month')
      .addSelect('COUNT(ticket.id)', 'totalBookings')
      .addSelect('SUM(ticket.amount)', 'totalRevenue')
      .where('partner.id = :userId', { userId: user.id })
      .andWhere('ticket.status = :status', { status: 'paid' })
      .groupBy('year, month')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      year: parseInt(item.year),
      month: parseInt(item.month),
      totalBookings: parseInt(item.totalBookings),
      totalRevenue: parseFloat(item.totalRevenue) || 0,
    }));
  }

  async getNewBooking(user: User): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { room: { partner: { id: user.id } } },
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }
}
