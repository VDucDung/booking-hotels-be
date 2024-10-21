import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeUtility } from './entities/type_utility.entity';
import { CreateTypeUtilityDto } from './dto/create-type-utility.dto';
import { UpdateTypeUtilityDto } from './dto/update-type-utility.dto';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { HOTEL_MESSAGE, TYPE_UTILITY_MESSAGE } from 'src/messages';
import { HotelService } from '../hotels/hotel.service';

@Injectable()
export class TypeUtilityService {
  constructor(
    @InjectRepository(TypeUtility)
    private readonly typeUtilityRepository: Repository<TypeUtility>,

    private readonly localesService: LocalesService,

    private readonly hotelService: HotelService,
  ) {}

  async create(
    createTypeUtilityDto: CreateTypeUtilityDto,
  ): Promise<TypeUtility> {
    const typeUtility = await this.typeUtilityRepository.findOne({
      where: { name: createTypeUtilityDto.name },
    });

    if (typeUtility) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(
          TYPE_UTILITY_MESSAGE.TYPE_UTILITY_EXISTED,
        ),
      );
    }

    const hotel = await this.hotelService.findOne(createTypeUtilityDto.hotelId);

    if (!hotel) {
      ErrorHelper.BadRequestException(
        this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
      );
    }
    const newTypeUtility =
      this.typeUtilityRepository.create(createTypeUtilityDto);
    return this.typeUtilityRepository.save(newTypeUtility);
  }

  async findAll(): Promise<TypeUtility[]> {
    return this.typeUtilityRepository.find({ relations: ['utilities'] });
  }

  async findByHotelId(hotelId: number): Promise<TypeUtility[]> {
    console.log(hotelId);
    const hotel = await this.hotelService.findOne(hotelId);
    const typeUtility = await this.typeUtilityRepository.find({
      where: {
        hotel: {
          id: hotel.id,
        },
      },
      relations: ['utilities'],
    });
    if (!typeUtility) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(
          TYPE_UTILITY_MESSAGE.TYPE_UTILITY_NOT_FOUND,
        ),
      );
    }
    return typeUtility;
  }

  async findOne(id: number): Promise<TypeUtility> {
    const typeUtility = await this.typeUtilityRepository.findOne({
      where: { id },
      relations: ['utilities'],
    });
    if (!typeUtility) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(
          TYPE_UTILITY_MESSAGE.TYPE_UTILITY_NOT_FOUND,
        ),
      );
    }
    return typeUtility;
  }

  async update(
    id: number,
    updateTypeUtilityDto: UpdateTypeUtilityDto,
  ): Promise<TypeUtility> {
    const typeUtility = await this.findOne(id);
    if (updateTypeUtilityDto.hotelId) {
      const hotel = await this.hotelService.findOne(
        updateTypeUtilityDto.hotelId,
      );
      if (!hotel) {
        ErrorHelper.BadRequestException(
          this.localesService.translate(HOTEL_MESSAGE.HOTEL_NOT_FOUND),
        );
      }
      typeUtility.hotel = hotel;
    }
    if (updateTypeUtilityDto.name) {
      typeUtility.name = updateTypeUtilityDto.name;
    }
    return this.typeUtilityRepository.save(typeUtility);
  }

  async remove(id: number): Promise<void> {
    const typeUtility = await this.findOne(id);
    await this.typeUtilityRepository.remove(typeUtility);
  }
}
