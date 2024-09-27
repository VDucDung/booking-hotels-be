import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { ErrorHelper } from 'src/common/helpers';
import { LocalesService } from '../locales/locales.service';
import { AUTH_MESSAGE, FAVORITE_MESSAGE } from 'src/messages';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly localesService: LocalesService,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const favorite = this.favoriteRepository.create({
      ...createFavoriteDto,
    });
    return await this.favoriteRepository.save(favorite);
  }

  async findAll(userId: number): Promise<Favorite[]> {
    return await this.favoriteRepository.find({ where: { userId } });
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
    });

    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }

    if (favorite.userId !== user.id) {
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
    });

    if (!favorite) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(FAVORITE_MESSAGE.FAVORITE_NOT_FOUND),
      );
    }

    if (favorite.userId !== user.id) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    await this.favoriteRepository.remove(favorite);
  }
}
