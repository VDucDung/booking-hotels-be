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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from './room.service';
import { ROOM_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { ErrorHelper } from 'src/common/helpers';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { EUserPermission } from 'src/enums/roles.enum';
import { multerOptions } from '../uploads/options/multer.option';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
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
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.CREATE_ROOM)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions.fileFilter))
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @UserDecorator() user: User,
  ): Promise<{ message: string; data: Room }> {
    const newRoom = await this.roomService.create(user, createRoomDto, files);

    return {
      message: this.localesService.translate(ROOM_MESSAGE.CREATE_ROOM_SUCCESS),
      data: newRoom,
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API Upload file to cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.UPDATE_ROOM)
  @UseInterceptors(FileInterceptor('file', multerOptions.fileFilter))
  async update(
    @Param('id') id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @UploadedFile() file,
    @UserDecorator() user: any,
  ): Promise<{ message: string; data: Room }> {
    return {
      message: this.localesService.translate(ROOM_MESSAGE.UPDATE_ROOM_SUCCESS),
      data: await this.roomService.update(id, user, updateRoomDto),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @PermissionDecorator(EUserPermission.DELETE_ROOM)
  async remove(
    @Param('id') id: number,
    @UserDecorator() user: any,
  ): Promise<void> {
    const result = await this.roomService.remove(id, user);
    if (!result) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(ROOM_MESSAGE.DELETE_ROOM_FAIL),
      );
    }
  }
}
