import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UploadService } from '../uploads/upload.service';
import { AUTH_MESSAGE, ROOM_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { ErrorHelper } from 'src/common/helpers';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly uploadService: UploadService,
    private readonly localesService: LocalesService,
  ) {}

  async create(
    createRoomDto: CreateRoomDto,
    userId: number,
    file: any,
  ): Promise<Room> {
    createRoomDto.partnerId = userId;

    let url = createRoomDto.images[0];
    if (file) {
      url = await this.uploadService.uploadImage(file);
      createRoomDto.images = [url];
    }

    const newRoom = this.roomRepository.create(createRoomDto);
    await this.roomRepository.save(newRoom);
    return newRoom;
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      ErrorHelper.NotFoundException(ROOM_MESSAGE.ROOM_NOT_FOUND);
    }
    return room;
  }

  async update(
    id: number,
    userId: number,
    updateRoomDto: UpdateRoomDto,
    file: any,
  ): Promise<Room> {
    const room = await this.findOne(id);
    if (room.partnerId !== userId) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    if (file) {
      room.images = [await this.uploadService.uploadImage(file)];
    }

    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const room = await this.findOne(id);
    if (room.partnerId !== userId) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    room.deleted = true;
    await this.roomRepository.save(room);
    return true;
  }
}
