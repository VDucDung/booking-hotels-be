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
import { User } from '../users/entities/user.entity';
import { imageDefault } from 'src/constants/image-default.constants';

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
    files: Array<Express.Multer.File>,
  ): Promise<Room> {
    let urls: string[];

    try {
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          this.uploadService.uploadImage(file),
        );
        urls = await Promise.all(uploadPromises);
      } else {
        urls = [imageDefault];
      }
    } catch (error) {
      throw new Error(`Error uploading images: ${error.message}`);
    }

    const newRoom = this.roomRepository.create({
      ...createRoomDto,
      images: urls,
    });

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
    user: User,
    updateRoomDto: UpdateRoomDto,
    file: any,
  ): Promise<Room> {
    const room = await this.findOne(id);
    if (room.partnerId !== user.id && user.role.name !== 'ADMIN') {
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

  async remove(id: number, user: User): Promise<boolean> {
    const room = await this.findOne(id);
    if (room.partnerId !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    this.roomRepository.remove(room);
    await this.roomRepository.save(room);
    return true;
  }

  async updateBookingDate(roomId: number, bookingDate: Date): Promise<Room> {
    const room = await this.findOne(roomId);
    room.bookingDate = bookingDate;
    return await this.roomRepository.save(room);
  }
}
