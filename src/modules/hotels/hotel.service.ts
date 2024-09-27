import { Injectable } from '@nestjs/common';
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

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private readonly localesService: LocalesService,
  ) {}
  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
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
}
