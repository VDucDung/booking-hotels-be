import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Request,
  UseGuards,
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

@Controller('favorites')
@ApiBearerAuth()
@ApiTags('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @Post()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_FAVORITE)
  async create(
    @Request() req: any,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    createFavoriteDto.userId = req.user.id;
    return await this.favoriteService.create(createFavoriteDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Request() req: any) {
    const user: User = req.user;
    return await this.favoriteService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Request() req: any, @Param('id') id: string) {
    const user: User = req.user;
    return await this.favoriteService.findOne({ id, user });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_FAVORITE)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    const user: User = req.user;
    return await this.favoriteService.update(id, user, updateFavoriteDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_FAVORITE)
  async remove(@Request() req: any, @Param('id') id: string) {
    const user: User = req.user;
    return await this.favoriteService.remove(id, user);
  }
}
