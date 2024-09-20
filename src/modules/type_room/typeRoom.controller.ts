import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TypeRoomService } from './typeRoom.service';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { TYPE_ROOM_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';

@ApiTags('TypeRoom')
@Controller('type-room')
export class TypeRoomController {
  constructor(
    private readonly typeRoomService: TypeRoomService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new type room' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Type room created' })
  async create(@Body() createTypeRoomDto: CreateTypeRoomDto) {
    return {
      message: this.localesService.translate(
        TYPE_ROOM_MESSAGE.CREATE_TYPE_ROOM_SUCCESS,
      ),
      data: await this.typeRoomService.create(createTypeRoomDto),
    };
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get type room by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type room found by ID',
  })
  async findOne(@Param('id') id: string) {
    return await this.typeRoomService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update type room by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type room updated',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTypeRoomDto: UpdateTypeRoomDto,
  ) {
    return await this.typeRoomService.update(id, updateTypeRoomDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete type room by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Type room deleted',
  })
  async remove(@Param('id') id: string) {
    return await this.typeRoomService.remove(id);
  }
}
