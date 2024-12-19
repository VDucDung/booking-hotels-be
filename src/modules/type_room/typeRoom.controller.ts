import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TypeRoomService } from './typeRoom.service';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { TYPE_ROOM_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { EUserPermission } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('TypeRoom')
@Controller('type-room')
export class TypeRoomController {
  constructor(
    private readonly typeRoomService: TypeRoomService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.CREATE_TYPE_ROOM)
  async create(
    @Body() createTypeRoomDto: CreateTypeRoomDto,
    @UserDecorator() user: User,
  ) {
    return {
      message: this.localesService.translate(
        TYPE_ROOM_MESSAGE.CREATE_TYPE_ROOM_SUCCESS,
      ),
      data: await this.typeRoomService.create(createTypeRoomDto, user),
    };
  }

  @Get('search')
  async searchTypeRooms(
    @Query('hotelId') hotelId: number,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('capacity') capacity: number,
    @Query('numberOfRooms') numberOfRooms: number,
  ) {
    return this.typeRoomService.searchTypeRooms(
      hotelId,
      startDate,
      endDate,
      capacity,
      numberOfRooms,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all type rooms' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all type rooms',
  })
  async findAll() {
    return await this.typeRoomService.findAll();
  }

  @Get('hotel/:hotelId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async getTypeRoomByHotelId(@Param('hotelId') hotelId: number) {
    return await this.typeRoomService.getTypeRoomByHotelId(hotelId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get type room by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type room found by ID',
  })
  async findOne(@Param('id') id: number) {
    return await this.typeRoomService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.UPDATE_TYPE_ROOM)
  async update(
    @Param('id') id: number,
    @Body() updateTypeRoomDto: UpdateTypeRoomDto,
    @UserDecorator() user: User,
  ) {
    return await this.typeRoomService.update(id, updateTypeRoomDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.DELETE_TYPE_ROOM)
  async remove(@Param('id') id: number, @UserDecorator() user: any) {
    return await this.typeRoomService.remove(id, user);
  }
}
