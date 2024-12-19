import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import {
  AUTH_MESSAGE,
  FAVORITE_MESSAGE,
  HOTEL_MESSAGE,
  USER_MESSAGE,
} from 'src/messages';
import { UserService } from '../users/user.service';
import { HotelService } from '../hotels/hotel.service';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly localesService: LocalesService,
    private readonly userService: UserService,

    @Inject(forwardRef(() => HotelService))
    private readonly hotelService: HotelService,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const { userId, hotelId } = createFavoriteDto;
    const user = await this.userService.getUserById(userId);
    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }

    const hotel = await this.hotelService.findOne(hotelId);
    if (!hotel) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
      );
    }

    const favorite = this.favoriteRepository.create({
      user: user,
      hotel: hotel,
    });

    await this.hotelService.updateFavorite(hotel.id, favorite);
    await this.favoriteRepository.save(favorite);
    delete favorite.user;
    delete favorite.hotel.partner;
    return favorite;
  }

  async findAll(userId: number): Promise<Favorite[]> {
    const user = await this.userService.getUserById(userId);

    return await this.favoriteRepository.find({
      where: { user: { id: user.id } },
      relations: ['hotel'],
    });
  }
  async getFavoriteHotels(
    userId: number,
    limit: number = 10,
    page: number = 1,
    keyword?: string,
    sortBy?: string,
  ) {
    const query = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.hotel', 'hotel')
      .leftJoin('hotel.reviews', 'reviews')
      .leftJoinAndSelect('hotel.typeRooms', 'typeRooms')
      .select([
        'favorite.id',
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
      ])
      .addSelect(
        'ROUND(COALESCE(AVG(reviews.rating), 0), 1)',
        'hotel_avg_rating',
      )
      .addSelect('COUNT(DISTINCT reviews.id)', 'hotel_total_reviews')
      .where('favorite.user.id = :userId', { userId })
      .groupBy('hotel.id')
      .addGroupBy('typeRooms.id')
      .addGroupBy('favorite.id');

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

    const favoriteHotelsWithRatings = result.entities.map(
      (hotel: any, index: number) => {
        const rawHotel = result.raw[index];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { avgRating, totalReviews, ...rest } = hotel.hotel;
        return {
          ...rest,
          avgRating:
            rawHotel?.hotel_avg_rating !== null
              ? parseFloat(rawHotel.hotel_avg_rating)
              : 0,
          totalReviews:
            rawHotel?.hotel_total_reviews !== null
              ? parseInt(rawHotel.hotel_total_reviews)
              : 0,
          typeRooms: hotel.typeRooms || [],
        };
      },
    );

    return {
      data: favoriteHotelsWithRatings,
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

  async findById(id: number, user: User): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        id,
      },
      relations: ['hotel', 'user'],
    });
    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }
    if (favorite.user.id !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }
    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }
    return favorite;
  }

  async findOne(args: any): Promise<Favorite> {
    return this.favoriteRepository.findOne(args);
  }

  async update(
    id: string,
    user: User,
    updateFavoriteDto: UpdateFavoriteDto,
  ): Promise<Favorite> {
    const favorite = await this.findOne({
      where: {
        id,
      },
      relations: ['hotel', 'user'],
    });

    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }

    if (favorite.user.id !== user.id) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    Object.assign(favorite, updateFavoriteDto);

    return this.favoriteRepository.save(favorite);
  }

  async remove(id: string, user: User): Promise<void> {
    const favorite = await this.findOne({
      where: {
        hotel: { id },
        user: {
          id: user.id,
        },
      },
      relations: ['hotel', 'user'],
    });
    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }

    const hotel = await this.hotelService.findOne(favorite.hotel.id);

    await this.hotelService.updateFavorite(hotel.id, null);
    await this.favoriteRepository.remove(favorite);
  }
}
