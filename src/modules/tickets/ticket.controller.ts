import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketService } from './ticket.service';
import { LocalesService } from '../locales/locales.service';
import { TICKET_MESSAGE } from 'src/messages';
import { Ticket } from './entities/ticket.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async create(
    @UserDecorator() user,
    @Body() createTicketDto: CreateTicketDto,
  ): Promise<{
    message: string;
    data: Ticket;
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.CREATE_TICKET_SUCCESS,
      ),
      data: await this.ticketService.create(user.id, createTicketDto),
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async findTicketByUserId(@UserDecorator() user): Promise<{
    message: string;
    data: Ticket[];
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.GET_LIST_TICKET_SUCCESS,
      ),
      data: await this.ticketService.findTicketByUserId(user.id),
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<{
    message: string;
    data: Ticket;
  }> {
    return {
      message: this.localesService.translate(TICKET_MESSAGE.GET_TICKET_SUCCESS),
      data: await this.ticketService.findOne(id),
    };
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  // @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async update(
    @Param('id') id: string,
    @UserDecorator() user,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<{
    message: string;
    data: Ticket;
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.UPDATE_TICKET_SUCCESS,
      ),
      data: await this.ticketService.update(id, user, updateTicketDto),
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @UserDecorator() user,
  ): Promise<{
    message: string;
  }> {
    await this.ticketService.remove(id, user);

    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.DELETE_TICKET_SUCCESS,
      ),
    };
  }
}
