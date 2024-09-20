import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketService } from './ticket.service';
import { LocalesService } from '../locales/locales.service';
import { TICKET_MESSAGE } from 'src/messages';
import { Ticket } from './entities/ticket.entity';
import { ErrorHelper } from 'src/common/helpers';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto): Promise<{
    message: string;
    data: Ticket;
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.CREATE_TICKET_SUCCESS,
      ),
      data: await this.ticketService.create(createTicketDto),
    };
  }

  @Get()
  async findAll(): Promise<{
    message: string;
    data: Ticket[];
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.GET_LIST_TICKET_SUCCESS,
      ),
      data: await this.ticketService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{
    message: string;
    data: Ticket;
  }> {
    return {
      message: this.localesService.translate(TICKET_MESSAGE.GET_TICKET_SUCCESS),
      data: await this.ticketService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<{
    message: string;
    data: Ticket;
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.UPDATE_TICKET_SUCCESS,
      ),
      data: await this.ticketService.update(id, updateTicketDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{
    message: string;
  }> {
    const deletedTicket = await this.ticketService.remove(id);
    if (!deletedTicket) {
      ErrorHelper.BadRequestException(TICKET_MESSAGE.DELETE_TICKET_FAIL);
    }
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.DELETE_TICKET_SUCCESS,
      ),
    };
  }
}
