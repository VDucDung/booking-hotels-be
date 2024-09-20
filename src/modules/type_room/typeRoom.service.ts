import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeRoom } from './entities/type_room.entity';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { TYPE_ROOM_MESSAGE } from 'src/messages';
import { HotelService } from '../hotels/hotel.service';

@Injectable()
export class TypeRoomService {
  constructor(
    @InjectRepository(TypeRoom)
    private readonly typeRoomRepository: Repository<TypeRoom>,
    private readonly hotelService: HotelService,
    private readonly localesService: LocalesService,
  ) {}

  async create(createTypeRoomDto: CreateTypeRoomDto): Promise<TypeRoom> {
    const hotel = await this.hotelService.findOne(createTypeRoomDto.hotelId);

    if (!hotel) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND),
      );
    }

    const newTypeRoom = this.typeRoomRepository.create({
      ...createTypeRoomDto,
      hotelId: hotel,
    });

    return this.typeRoomRepository.save(newTypeRoom);
  }

  async findAll(): Promise<TypeRoom[]> {
    return this.typeRoomRepository.find({ relations: ['hotelId', 'rooms'] });
  }

  async findOne(id: string): Promise<TypeRoom> {
    const typeRoom = await this.typeRoomRepository.findOne({
      where: { id },
      relations: ['hotelId', 'rooms'],
    });

    if (!typeRoom) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND),
      );
    }

    return typeRoom;
  }

  async update(
    id: string,
    updateTypeRoomDto: UpdateTypeRoomDto,
  ): Promise<TypeRoom> {
    const typeRoom = await this.findOne(id);

    if (updateTypeRoomDto.hotelId) {
      const hotel = await this.hotelService.findOne(updateTypeRoomDto.hotelId);

      if (!hotel) {
        ErrorHelper.NotFoundException(
          this.localesService.translate(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND),
        );
      }

      typeRoom.hotelId = hotel;
    }

    Object.assign(typeRoom, updateTypeRoomDto);

    return this.typeRoomRepository.save(typeRoom);
  }

  async remove(id: string): Promise<void> {
    const typeRoom = await this.findOne(id);
    await this.typeRoomRepository.remove(typeRoom);
  }
}
