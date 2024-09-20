import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from './room.service';
import { ROOM_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { ErrorHelper } from 'src/common/helpers';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<{ message: string; data: Room }> {
    return {
      message: this.localesService.translate(ROOM_MESSAGE.CREATE_ROOM_SUCCESS),
      data: await this.roomService.create(createRoomDto),
    };
  }

  @Get()
  async findAll(): Promise<{
    message: string;
    data: Room[];
  }> {
    return {
      message: this.localesService.translate(
        ROOM_MESSAGE.GET_LIST_ROOM_SUCCESS,
      ),
      data: await this.roomService.findAll(),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ message: string; data: Room }> {
    return {
      message: this.localesService.translate(ROOM_MESSAGE.GET_ROOM_SUCCESS),
      data: await this.roomService.findOne(id),
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<{ message: string; data: Room }> {
    return {
      message: this.localesService.translate(ROOM_MESSAGE.UPDATE_ROOM_SUCCESS),
      data: await this.roomService.update(id, updateRoomDto),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    const result = await this.roomService.remove(id);
    if (!result) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(ROOM_MESSAGE.DELETE_ROOM_FAIL),
      );
    }
  }
}
