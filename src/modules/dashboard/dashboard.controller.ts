import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ERole } from 'src/enums/roles.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { Ticket } from '../tickets/entities/ticket.entity';
import { LocalesService } from '../locales/locales.service';
import {
  HOTEL_MESSAGE,
  ROOM_MESSAGE,
  TICKET_MESSAGE,
  TYPE_ROOM_MESSAGE,
} from 'src/messages';
import { TicketService } from '../tickets/ticket.service';
import { HotelService } from '../hotels/hotel.service';
import { Hotel } from '../hotels/entities/hotel.entity';
import { CreateHotelDto } from '../hotels/dto/create-hotel.dto';
import { TypeRoomService } from '../type_room/typeRoom.service';
import { TypeRoom } from '../type_room/entities/type_room.entity';
import { UpdateTypeRoomDto } from '../type_room/dto/update-type-room.dto';
import { RoomService } from '../room/room.service';
import { Room } from '../room/entities/room.entity';
import { UpdateRoomDto } from '../room/dto/update-room.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../uploads/options/multer.option';
import { UpdateHotelDto } from '../hotels/dto/update-hotel.dto';
import { CreateTypeRoomDto } from '../type_room/dto/create-type-room.dto';
import { CreateRoomDto } from '../room/dto/create-room.dto';
import { UpdateTicketDto } from '../tickets/dto/update-ticket.dto';
import { UploadService } from '../uploads/upload.service';
import { User } from '../users/entities/user.entity';
import { GroupedTypeRooms } from 'src/interfaces/typeRoom.interface';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly localesService: LocalesService,
    private readonly ticketService: TicketService,
    private readonly hotelService: HotelService,
    private readonly typeRoomService: TypeRoomService,
    private readonly roomService: RoomService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('tickets')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async findTicketByPartnerId(@UserDecorator() user): Promise<{
    message: string;
    data: Ticket[];
  }> {
    return {
      message: this.localesService.translate(
        TICKET_MESSAGE.GET_LIST_TICKET_SUCCESS,
      ),
      data: await this.ticketService.findTicketByPartnerId(user.id),
    };
  }

  @Put('tickets/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async updateTicketByPartnerId(
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

  @Delete('tickets/:id')
  @ApiBearerAuth()
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  @UseGuards(AuthGuard)
  async removeTicketByPartnerId(
    @Param('id') id: string,
    @UserDecorator() user,
  ): Promise<{
    statusCode: number;
    message: string;
  }> {
    await this.ticketService.remove(id, user);

    return {
      statusCode: HttpStatus.OK,
      message: this.localesService.translate(
        TICKET_MESSAGE.DELETE_TICKET_SUCCESS,
      ),
    };
  }

  @Get('hotels')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async findHotelByPartnerId(@UserDecorator() user): Promise<{
    message: string;
    data: Hotel[];
  }> {
    return {
      message: this.localesService.translate(HOTEL_MESSAGE.GET_HOTELS_SUCCESS),
      data: await this.hotelService.findHotelByPartnerId(user.id),
    };
  }

  @Post('hotels')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        hotelName: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
        contactPhone: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions.fileFilter))
  async createHotelByPartnerId(
    @UserDecorator() user,
    @Body() createHotelDto: CreateHotelDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ): Promise<{
    message: string;
    data: Hotel;
  }> {
    return {
      message: this.localesService.translate(
        HOTEL_MESSAGE.CREATE_HOTEL_SUCCESS,
      ),
      data: await this.hotelService.create(user, createHotelDto, images),
    };
  }

  @Put('hotels/:hotelId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        hotelName: { type: 'string' },
        address: { type: 'string' },
        contactPhone: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions.fileFilter))
  async updateHotelByPartnerId(
    @Param('hotelId') hotelId: number,
    @UserDecorator() user: User,
    @Body() updateHotelDto: UpdateHotelDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<{ message: string; data: Hotel }> {
    if (files?.length) {
      const uploadedUrls = await Promise.all(
        files.map((file) => this.uploadService.uploadImage(file)),
      );
      updateHotelDto.images = [
        ...(updateHotelDto.images || []),
        ...uploadedUrls,
      ];
    }

    const updatedHotel = await this.hotelService.update(
      hotelId,
      updateHotelDto,
      user,
    );

    return {
      message: this.localesService.translate(
        HOTEL_MESSAGE.UPDATE_HOTEL_SUCCESS,
      ),
      data: updatedHotel,
    };
  }

  @Delete('hotels/:hotelId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async deleteHotelByPartnerId(
    @UserDecorator() user,
    @Param('hotelId') hotelId: number,
  ): Promise<{
    message: string;
  }> {
    await this.hotelService.remove(hotelId, user);
    return {
      message: this.localesService.translate(
        HOTEL_MESSAGE.DELETE_HOTEL_SUCCESS,
      ),
    };
  }

  @Post('typeRooms')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async createTypeRoomByPartnerId(
    @Body() createTypeRoomDto: CreateTypeRoomDto,
    @UserDecorator() user,
  ): Promise<{
    message: string;
    data: TypeRoom;
  }> {
    return {
      message: this.localesService.translate(
        TYPE_ROOM_MESSAGE.CREATE_TYPE_ROOM_SUCCESS,
      ),
      data: await this.typeRoomService.create(createTypeRoomDto, user),
    };
  }

  @Get('typeRooms')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async findTypeRoomByPartnerId(@UserDecorator() user): Promise<{
    message: string;
    data: GroupedTypeRooms;
  }> {
    return {
      message: 'Get type rooms successfully',
      data: await this.typeRoomService.findTypeRoomByPartnerId(user.id),
    };
  }

  @Put('typeRooms/:typeRoomId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async updateTypeRoomByPartnerId(
    @UserDecorator() user,
    @Body() updateTypeRoomDto: UpdateTypeRoomDto,
    @Param('typeRoomId') typeRoomId: number,
  ): Promise<{
    message: string;
    data: TypeRoom;
  }> {
    return {
      message: this.localesService.translate(
        TYPE_ROOM_MESSAGE.UPDATE_TYPE_ROOM_SUCCESS,
      ),
      data: await this.typeRoomService.update(
        typeRoomId,
        updateTypeRoomDto,
        user,
      ),
    };
  }

  @Delete('typeRooms/:typeRoomId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async removeHotelByPartnerId(
    @UserDecorator() user,
    @Param('typeRoomId') typeRoomId: number,
  ): Promise<{
    message: string;
  }> {
    await this.typeRoomService.remove(typeRoomId, user);
    return {
      message: this.localesService.translate(
        TYPE_ROOM_MESSAGE.DELETE_TYPE_ROOM_SUCCESS,
      ),
    };
  }

  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['roomName', 'price', 'typeRoomId'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        roomName: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              feature: { type: 'string' },
              availability: { type: 'boolean' },
            },
          },
        },
        price: {
          type: 'number',
        },
        typeRoomId: {
          type: 'number',
        },
        capacity: {
          type: 'number',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions.fileFilter))
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @UserDecorator() user,
  ): Promise<{ message: string; data: Room }> {
    const newRoom = await this.roomService.create(user, createRoomDto, files);

    return {
      message: this.localesService.translate(ROOM_MESSAGE.CREATE_ROOM_SUCCESS),
      data: newRoom,
    };
  }

  @Get('rooms')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async findRoomByPartnerId(@UserDecorator() user): Promise<{
    message: string;
    data: Room[];
  }> {
    return {
      message: this.localesService.translate(
        ROOM_MESSAGE.GET_LIST_ROOM_SUCCESS,
      ),
      data: await this.roomService.findRoomByPartnerId(user.id),
    };
  }

  @Put('rooms/:roomId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        roomName: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              feature: { type: 'string' },
              availability: { type: 'boolean' },
            },
          },
        },
        price: {
          type: 'number',
        },
        typeRoomId: {
          type: 'number',
        },
        capacity: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions.fileFilter))
  async updateRoomByPartnerId(
    @Param('roomId') roomId: number,
    @UserDecorator() user: User,
    @Body() updateRoomDto: UpdateRoomDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<{
    message: string;
    data: Room;
  }> {
    if (files?.length) {
      const uploadedUrls = await Promise.all(
        files.map((file) => this.uploadService.uploadImage(file)),
      );
      updateRoomDto.images = [...(updateRoomDto.images || []), ...uploadedUrls];
    }
    return {
      message: this.localesService.translate(ROOM_MESSAGE.UPDATE_ROOM_SUCCESS),
      data: await this.roomService.update(roomId, user, updateRoomDto),
    };
  }

  @Delete('room/:roomId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.ADMIN, ERole.PARTNER])
  async removeRoomByPartnerId(
    @UserDecorator() user,
    @Param('roomId') roomId: number,
  ): Promise<{
    message: string;
  }> {
    await this.roomService.remove(roomId, user);
    return {
      message: this.localesService.translate(ROOM_MESSAGE.DELETE_ROOM_SUCCESS),
    };
  }
}
