import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { HOTEL_MESSAGE } from 'src/messages';

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

  async findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find();
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

  async update(id: number, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    const hotel = await this.findOne(id);
    if (!hotel) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
      );
    }
    await this.hotelRepository.update(id, updateHotelDto);
    return this.hotelRepository.save(hotel);
  }

  async remove(id: number): Promise<void> {
    const hotel = await this.findOne(id);
    hotel.deleted = true;
    await this.hotelRepository.save(hotel);
  }
}
