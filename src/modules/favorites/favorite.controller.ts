import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';

import { User } from 'src/modules/users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ERole, EUserPermission } from 'src/enums/roles.enum';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { Favorite } from './entities/favorite.entity';
import { FAVORITE_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { QueryParamsDto } from '../hotels/dto/query-params.dto';

@Controller('favorites')
@ApiBearerAuth()
@ApiTags('favorites')
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
    private readonly localesService: LocalesService,
  ) {}
  @Post()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_FAVORITE)
  async create(
    @UserDecorator() user: User,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<{ message: string; statusCode: number; data: Favorite }> {
    createFavoriteDto.userId = user.id;
    return {
      message: this.localesService.translate(
        FAVORITE_MESSAGE.CREATE_FAVORITE_SUCCESS,
      ),
      statusCode: HttpStatus.CREATED,
      data: await this.favoriteService.create(createFavoriteDto),
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @UserDecorator() user: User,
  ): Promise<{ message: string; statusCode: number; data: Favorite[] }> {
    return {
      message: this.localesService.translate(
        FAVORITE_MESSAGE.GET_FAVORITE_SUCCESS,
      ),
      statusCode: HttpStatus.OK,
      data: await this.favoriteService.findAll(user.id),
    };
  }

  @Get('/search')
  @UseGuards(AuthGuard)
  async getFavoriteHotels(
    @Query() queryParams: QueryParamsDto,
    @UserDecorator() user: User,
  ): Promise<{
    message: string;
    statusCode: number;
    data: { favorite: Favorite[]; detailResult: any };
  }> {
    const { limit, page, keyword, sortBy } = queryParams;
    const sanitizedLimit = limit && !isNaN(limit) && limit > 0 ? limit : 10;
    const sanitizedPage = page && !isNaN(page) && page > 0 ? page : 1;
    const { data, detailResult } = await this.favoriteService.getFavoriteHotels(
      user.id,
      sanitizedLimit,
      sanitizedPage,
      keyword,
      sortBy,
    );
    return {
      message: this.localesService.translate(
        FAVORITE_MESSAGE.GET_FAVORITE_SUCCESS,
      ),
      statusCode: HttpStatus.OK,
      data: { favorite: data, detailResult },
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @UserDecorator() user: User,
    @Param('id') id: number,
  ): Promise<{ message: string; statusCode: number; data: Favorite }> {
    return {
      message: this.localesService.translate(
        FAVORITE_MESSAGE.GET_FAVORITE_SUCCESS,
      ),
      statusCode: HttpStatus.OK,
      data: await this.favoriteService.findById(id, user),
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_FAVORITE)
  async update(
    @Param('id') id: string,
    @UserDecorator() user: User,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return await this.favoriteService.update(id, user, updateFavoriteDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.USER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_FAVORITE)
  async remove(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<{ message: string; statusCode: number }> {
    await this.favoriteService.remove(id, user);
    return {
      message: this.localesService.translate(
        FAVORITE_MESSAGE.DELETE_FAVORITE_SUCCESS,
      ),
      statusCode: HttpStatus.OK,
    };
  }
}
