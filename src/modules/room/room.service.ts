import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UploadService } from '../uploads/upload.service';
import { AUTH_MESSAGE, ROOM_MESSAGE, USER_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { ErrorHelper } from 'src/common/helpers';
import { User } from '../users/entities/user.entity';
import { imageDefault } from 'src/constants/image-default.constants';
import { UserService } from '../users/user.service';
import { TypeRoomService } from '../type_room/typeRoom.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly uploadService: UploadService,
    private readonly localesService: LocalesService,
    private readonly userService: UserService,
    private readonly typeRoomService: TypeRoomService,
  ) {}

  async create(
    user: User,
    createRoomDto: CreateRoomDto,
    files: Array<Express.Multer.File>,
  ): Promise<Room> {
    const partner = await this.userService.getUserById(user.id);
    if (!partner) {
      ErrorHelper.NotFoundException(USER_MESSAGE.USER_NOT_FOUND);
    }

    const typeRoom = await this.typeRoomService.findOne(
      createRoomDto.typeRoomId,
    );
    let urls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.uploadService.uploadImage(file),
      );
      urls = await Promise.all(uploadPromises);
    } else {
      const image = imageDefault;
      urls = [image];
    }

    const newRoom = this.roomRepository.create({
      ...createRoomDto,
      images: urls,
      partner,
      typeRoomId: typeRoom,
    });

    await this.roomRepository.save(newRoom);
    delete newRoom.partner;
    return newRoom;
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findRoomByPartnerId(partnerId: number): Promise<Room[]> {
    return await this.roomRepository.find({
      where: {
        partner: {
          id: partnerId,
        },
      },
      relations: ['typeRoomId', 'typeRoomId.hotel'],
      select: {
        typeRoomId: {
          id: true,
          name: true,
          hotel: {
            id: true,
            hotelName: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['partner'],
      select: {
        partner: {
          id: true,
        },
      },
    });

    if (!room) {
      ErrorHelper.NotFoundException(ROOM_MESSAGE.ROOM_NOT_FOUND);
    }

    return room;
  }

  async findByPartnerId(partnerId: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: {
        partner: {
          id: partnerId,
        },
      },
      relations: ['partner'],
      select: {
        partner: {
          id: true,
        },
      },
    });

    if (!room) {
      ErrorHelper.NotFoundException(ROOM_MESSAGE.ROOM_NOT_FOUND);
    }

    return room;
  }

  async update(
    id: number,
    user: User,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const room = await this.findOne(id);
    if (room.partner.id !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    if (updateRoomDto?.typeRoomId) {
      await this.typeRoomService.findOne(updateRoomDto.typeRoomId);
    }

    Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(room);
  }

  async remove(id: number, user: User): Promise<boolean> {
    const room = await this.findOne(id);
    if (room.partner.id !== user.id && user.role.name !== 'ADMIN') {
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
