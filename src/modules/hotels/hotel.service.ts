import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { AUTH_MESSAGE, HOTEL_MESSAGE } from 'src/messages';
import ApiFeature from 'src/common/utils/apiFeature.util';
import { QueryParams } from 'src/interfaces';
import { User } from '../users/entities/user.entity';
import { UploadService } from '../uploads/upload.service';
import { imageDefault } from 'src/constants/image-default.constants';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private readonly localesService: LocalesService,
    private readonly uploadService: UploadService,
  ) {}
  async create(
    createHotelDto: CreateHotelDto,
    files: Array<Express.Multer.File>,
  ): Promise<Hotel> {
    let urls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.uploadService.uploadImage(file),
      );
      urls = await Promise.all(uploadPromises);
    } else {
      urls = [imageDefault];
    }

    createHotelDto.images = urls;
    const hotel = this.hotelRepository.create(createHotelDto);
    await this.hotelRepository.save(hotel);
    return hotel;
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
    const hotel = await this.hotelRepository.findOne({ where: { id } });
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
    if (!hotel) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
      );
    }

    if (hotel.partnerId !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    await this.hotelRepository.update(id, updateHotelDto);
    return this.hotelRepository.save(hotel);
  }

  async remove(id: number, user: User): Promise<void> {
    const hotel = await this.findOne(id);
    if (!hotel) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
      );
    }

    if (hotel.partnerId !== user.id && user.role.name !== 'ADMIN') {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    hotel.deleted = true;
    await this.hotelRepository.save(hotel);
  }

  async searchHotels(
    limit: number = 10,
    page: number = 1,
    keyword?: string,
    sortBy?: string,
  ) {
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.reviews', 'reviews')
      .leftJoinAndSelect('hotel.typeRooms', 'typeRooms')
      .leftJoinAndSelect('hotel.favoriteId', 'favorite')
      .select(['hotel'])
      .addSelect('COALESCE(AVG(reviews.rating), 0)', 'avg_rating')
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
          query.orderBy('avg_rating', order.toUpperCase() as 'ASC' | 'DESC');
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

    const rawHotels = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();
    const total = await query.getCount();

    const hotelsWithAvgRating = rawHotels.map((rawHotel) => ({
      id: rawHotel.hotel_id,
      hotelName: rawHotel.hotel_hotelName,
      address: rawHotel.hotel_address,
      description: rawHotel.hotel_description,
      images: rawHotel.hotel_images,
      createdAt: rawHotel.hotel_created_at,
      updatedAt: rawHotel.hotel_updated_at,
      deleted: rawHotel.hotel_deleted,
      partnerId: rawHotel.hotel_partner_id,
      favoriteId: rawHotel.hotel_favorite_id,
      avgRating: parseFloat(rawHotel.avg_rating) || 0,
    }));

    return {
      data: hotelsWithAvgRating,
      meta: {
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
