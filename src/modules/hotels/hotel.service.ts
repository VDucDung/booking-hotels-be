import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Repository } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import {
  AUTH_MESSAGE,
  FAVORITE_MESSAGE,
  HOTEL_MESSAGE,
  TYPE_ROOM_MESSAGE,
  USER_MESSAGE,
} from 'src/messages';
import ApiFeature from 'src/common/utils/apiFeature.util';
import { QueryParams } from 'src/interfaces';
import { User } from '../users/entities/user.entity';
import { UploadService } from '../uploads/upload.service';
import { imageDefault } from 'src/constants/image-default.constants';
import { UserService } from '../users/user.service';
import { Favorite } from '../favorites/entities/favorite.entity';
import { FavoriteService } from '../favorites/favorite.service';
import { TypeRoomService } from '../type_room/typeRoom.service';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private readonly localesService: LocalesService,
    private readonly uploadService: UploadService,
    private readonly userService: UserService,
    private readonly favoriteService: FavoriteService,
    private readonly typeRoomService: TypeRoomService,
    private connection: Connection,
  ) {}
  async create(
    createHotelDto: CreateHotelDto,
    files: Array<Express.Multer.File>,
  ): Promise<Hotel> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { partnerId, favoriteId, typeRoomIds } = createHotelDto;

      const partner = await this.userService.getUserById(partnerId);
      if (!partner) {
        ErrorHelper.NotFoundException(USER_MESSAGE.USER_NOT_FOUND);
      }

      let favorite: Favorite = null;
      if (favoriteId) {
        favorite = await this.favoriteService.findOne({
          where: { id: favoriteId },
        });
        if (!favorite) {
          ErrorHelper.NotFoundException(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND);
        }
      }

      const typeRooms = await this.typeRoomService.find({
        where: { id: In(typeRoomIds) },
      });
      if (typeRooms.length !== typeRoomIds.length) {
        ErrorHelper.NotFoundException(TYPE_ROOM_MESSAGE.TYPE_ROOM_NOT_FOUND);
      }

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
      const hotel = this.hotelRepository.create({
        ...createHotelDto,
        images: urls,
        partner,
        favorites: [favorite],
        typeRooms,
      });

      const savedHotel = await queryRunner.manager.save(hotel);

      await queryRunner.commitTransaction();
      return savedHotel;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryParams: QueryParams): Promise<any> {
    const apiFeature = new ApiFeature(this.hotelRepository, 'Hotel');

    const fieldsRegex = ['hotelName', 'address', 'description'];

    const { results, ...detailResult } = await apiFeature.getResults(
      queryParams,
      fieldsRegex,
    );

    const result = { hotels: results, ...detailResult };

    return result;
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['favorites', 'typeRooms', 'partner'],
      select: {
        partner: {
          id: true,
        },
      },
    });

    if (!hotel) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
      );
    }

    return hotel;
  }

  async update(
    id: number,
    updateHotelDto: UpdateHotelDto,
    user: User,
  ): Promise<Hotel> {
    const hotel = await this.findOne(id);
    if (hotel.partner.id !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    Object.assign(hotel, updateHotelDto);

    return this.hotelRepository.save(hotel);
  }

  async updateFavorite(id: number, favorite: Favorite | null): Promise<Hotel> {
    const hotel = await this.findOne(id);
    hotel.favorites.push(favorite);

    return this.hotelRepository.save(hotel);
  }

  async remove(id: number, user: User): Promise<void> {
    const hotel = await this.findOne(id);

    if (hotel.partner.id !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    await this.hotelRepository.remove(hotel);
  }

  async searchHotels(
    limit: number = 10,
    page: number = 1,
    keyword?: string,
    sortBy?: string,
  ) {
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoin('hotel.reviews', 'reviews')
      .leftJoinAndSelect('hotel.favorites', 'favorites')
      .leftJoinAndSelect('hotel.typeRooms', 'typeRooms')
      .select([
        'hotel.id',
        'hotel.hotelName',
        'hotel.address',
        'hotel.description',
        'hotel.images',
        'hotel.avgRating',
        'hotel.totalReviews',
        'hotel.createdAt',
        'hotel.updatedAt',
        'hotel.deleted',
        'hotel.partner',
        'favorites.id',
        'favorites.user',
      ])
      .addSelect(
        'ROUND(COALESCE(AVG(reviews.rating), 0), 1)',
        'hotel_avg_rating',
      )
      .addSelect('COUNT(DISTINCT reviews.id)', 'hotel_total_reviews')
      .groupBy('hotel.id')
      .addGroupBy('favorites.id')
      .addGroupBy('typeRooms.id');

    if (keyword) {
      query.andWhere(
        '(hotel.hotelName ILIKE :keyword OR hotel.address ILIKE :keyword OR hotel.description ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (sortBy) {
      const [field, order] = sortBy.split(':');
      if (this.isValidSortField(field) && this.isValidSortOrder(order)) {
        if (field === 'rating') {
          query.orderBy(
            'hotel_avg_rating',
            order.toUpperCase() as 'ASC' | 'DESC',
          );
        } else {
          query.orderBy(
            `hotel.${field}`,
            order.toUpperCase() as 'ASC' | 'DESC',
          );
        }
      } else {
        throw new BadRequestException('Invalid sortBy parameter');
      }
    } else {
      query.orderBy('hotel.createdAt', 'DESC');
    }

    const result = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    const total = result.entities.length;

    const hotelsWithRatings = result.entities.map(
      (hotel: any, index: number) => {
        const rawHotel = result.raw[index];
        return {
          ...hotel,
          avgRating:
            rawHotel?.hotel_avg_rating !== null
              ? parseFloat(rawHotel.hotel_avg_rating)
              : 0,
          totalReviews:
            rawHotel?.hotel_total_reviews !== null
              ? parseInt(rawHotel.hotel_total_reviews)
              : 0,
          typeRooms: hotel.typeRooms || [],
          favorites: hotel.favorites || [],
        };
      },
    );

    return {
      data: hotelsWithRatings,
      detailResult: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private isValidSortField(field: string): boolean {
    return ['createdAt', 'hotelName', 'address', 'rating'].includes(field);
  }

  private isValidSortOrder(order: string): boolean {
    return order.toLowerCase() === 'asc' || order.toLowerCase() === 'desc';
  }
}
