import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(
    user: User,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    const favorite = this.favoriteRepository.create({
      ...createFavoriteDto,
      user,
    });
    return await this.favoriteRepository.save(favorite);
  }

  async findAll(user: User): Promise<Favorite[]> {
    return await this.favoriteRepository.find({ where: { user } });
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
        user,
      },
    });
    Object.assign(favorite, updateFavoriteDto);
    return this.favoriteRepository.save(favorite);
  }

  async remove(id: string, user: User): Promise<void> {
    const favorite = await this.findOne({
      where: {
        id,
        user,
      },
    });
    await this.favoriteRepository.remove(favorite);
  }
}
