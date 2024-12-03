import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, In, Connection } from 'typeorm';
import { TypeRoom } from './entities/type_room.entity';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { AUTH_MESSAGE, TYPE_ROOM_MESSAGE } from 'src/messages';
import { User } from '../users/entities/user.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { HotelService } from '../hotels/hotel.service';
import { Room } from '../room/entities/room.entity';
import { GroupedTypeRooms } from 'src/interfaces/typeRoom.interface';

@Injectable()
export class TypeRoomService {
  constructor(
    @InjectRepository(TypeRoom)
    private readonly typeRoomRepository: Repository<TypeRoom>,
    private readonly localesService: LocalesService,
    private readonly connection: Connection,

    @Inject(forwardRef(() => HotelService))
    private readonly hotelService: HotelService,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(
    createTypeRoomDto: CreateTypeRoomDto,
    user: User,
  ): Promise<TypeRoom> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hotel = await queryRunner.manager.findOne(Hotel, {
        where: { id: createTypeRoomDto.hotelId },
        relations: ['partner'],
      });

      if (!hotel) {
        throw ErrorHelper.NotFoundException(
          this.localesService.translate(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND),
        );
      }

      if (hotel.partner.id !== user.id && user.role.name !== 'ADMIN') {
        throw ErrorHelper.ForbiddenException(
          this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
        );
      }

      const newTypeRoom = this.typeRoomRepository.create({
        ...createTypeRoomDto,
        hotel: hotel,
        partner: user,
      });

      const savedTypeRoom = await queryRunner.manager.save(newTypeRoom);

      await queryRunner.commitTransaction();
      delete savedTypeRoom.hotel;
      delete savedTypeRoom.partner;
      return savedTypeRoom;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<TypeRoom[]> {
    return this.typeRoomRepository.find({ relations: ['hotel', 'rooms'] });
  }

  async findTypeRoomByPartnerId(partnerId: number): Promise<GroupedTypeRooms> {
    const typeRooms = await this.typeRoomRepository.find({
      where: {
        partner: {
          id: partnerId,
        },
      },
      relations: ['hotel'],
      select: {
        id: true,
        hotel: {
          id: true,
          hotelName: true,
        },
        name: true,
        description: true,
        createdAt: true,
      },
    });

    const groupedTypeRooms = typeRooms.reduce(
      (acc, typeRoom) => {
        const hotelId = typeRoom.hotel.id;

        if (!acc[hotelId]) {
          acc[hotelId] = {
            hotelName: typeRoom.hotel.hotelName,
            typeRooms: [],
          };
        }

        acc[hotelId].typeRooms.push(typeRoom);
        return acc;
      },
      {} as { [hotelId: number]: { hotelName: string; typeRooms: TypeRoom[] } },
    );

    return groupedTypeRooms;
  }

  async find(options: FindManyOptions<TypeRoom>): Promise<TypeRoom[]> {
    return this.typeRoomRepository.find(options);
  }

  async findByIds(ids: number[]): Promise<TypeRoom[]> {
    return this.typeRoomRepository.find({
      where: { id: In(ids) },
      relations: ['hotel', 'rooms'],
    });
  }

  async getTypeRoomByHotelId(hotelId: number): Promise<TypeRoom[]> {
    const hotel = await this.hotelService.findOne(hotelId);
    return this.typeRoomRepository.find({
      where: { hotel: { id: hotel.id } },
      relations: ['rooms'],
    });
  }

  async findOne(id: number): Promise<TypeRoom> {
    const typeRoom = await this.typeRoomRepository.findOne({
      where: { id },
      relations: ['hotel', 'rooms', 'partner'],
      select: {
        partner: {
          id: true,
        },
      },
    });

    if (!typeRoom) {
      throw ErrorHelper.NotFoundException(
        this.localesService.translate(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND),
      );
    }

    return typeRoom;
  }

  async update(
    id: number,
    updateTypeRoomDto: UpdateTypeRoomDto,
    user: User,
  ): Promise<TypeRoom> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const typeRoom = await queryRunner.manager.findOne(TypeRoom, {
        where: { id },
        relations: ['partner', 'hotel'],
      });

      if (!typeRoom) {
        throw ErrorHelper.NotFoundException(
          this.localesService.translate(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND),
        );
      }

      if (typeRoom.partner.id !== user.id && user.role.name !== 'ADMIN') {
        throw ErrorHelper.ForbiddenException(
          this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
        );
      }

      Object.assign(typeRoom, updateTypeRoomDto);

      const updatedTypeRoom = await queryRunner.manager.save(typeRoom);

      await queryRunner.commitTransaction();
      delete updatedTypeRoom.hotel;
      delete updatedTypeRoom.partner;
      return updatedTypeRoom;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, user: User): Promise<void> {
    const typeRoom = await this.findOne(id);
    if (typeRoom.partner.id !== user.id && user.role.name !== 'ADMIN') {
      throw ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    await this.typeRoomRepository.remove(typeRoom);
  }

  async searchTypeRooms(
    hotelId: number,
    startDate: Date,
    endDate: Date,
    capacity: number,
    numberOfRooms: number,
  ): Promise<TypeRoom[]> {
    const typeRooms = await this.typeRoomRepository
      .createQueryBuilder('typeRoom')
      .leftJoinAndSelect('typeRoom.rooms', 'room')
      .where('room.capacity >= :capacity', { capacity })
      .andWhere('typeRoom.hotel = :hotelId', { hotelId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .from(Room, 'bookedRoom')
          .select('bookedRoom.type_room_id')
          .where('bookedRoom.bookingDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .getQuery();

        return 'typeRoom.id NOT IN ' + subQuery;
      })
      .andWhere((qb) => {
        const availableRoomsSubQuery = qb
          .subQuery()
          .from(Room, 'availableRoom')
          .select('COUNT(availableRoom.id)', 'availableRoomsCount')
          .where('availableRoom.type_room_id = typeRoom.id')
          .andWhere('availableRoom.bookingDate IS NULL')
          .getQuery();

        return `(${availableRoomsSubQuery}) >= :numberOfRooms`;
      })
      .setParameter('numberOfRooms', numberOfRooms)
      .getMany();

    return typeRooms;
  }

  async searchAvailableRooms(
    hotelId: number,
    startDate: Date,
    endDate: Date,
    capacity: number,
  ): Promise<Room[]> {
    return this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.typeRoomId', 'typeRoom')
      .where('room.capacity >= :capacity', { capacity })
      .andWhere('typeRoom.hotel = :hotelId', { hotelId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .from(Room, 'bookedRoom')
          .select('bookedRoom.id')
          .where('bookedRoom.bookingDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .getQuery();

        return 'room.id NOT IN ' + subQuery;
      })
      .getMany();
  }
}
