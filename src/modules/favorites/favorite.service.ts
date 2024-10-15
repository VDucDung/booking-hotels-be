import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
      userId: user,
      hotelId: hotel,
    });
    await this.favoriteRepository.save(favorite);

    return favorite;
  }

  async findAll(userId: number): Promise<Favorite[]> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }
    return await this.favoriteRepository.find({
      where: { userId: { id: userId } },
      relations: ['hotelId'],
    });
  }
  async findById(id: number, user: User): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        id,
      },
      relations: ['hotelId', 'userId'],
    });
    if (favorite.userId.id !== user.id && user.role.name !== 'admin') {
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
      relations: ['hotelId', 'userId'],
    });

    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }

    if (favorite.userId.id !== user.id) {
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
        id,
      },
      relations: ['hotelId', 'userId'],
    });
    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }

    if ((favorite.userId.id as number) !== (user.id as number)) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    await this.favoriteRepository.remove(favorite);
  }
}
