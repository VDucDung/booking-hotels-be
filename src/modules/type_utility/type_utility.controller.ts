import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TypeUtilityService } from './type_utility.service';
import { CreateTypeUtilityDto } from './dto/create-type-utility.dto';
import { TypeUtility } from './entities/type_utility.entity';
import { UpdateTypeUtilityDto } from './dto/update-type-utility.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ERole, EUserPermission } from 'src/enums/roles.enum';

@Controller('type-utilities')
@ApiTags('type-utilities')
export class TypeUtilityController {
  constructor(private readonly typeUtilityService: TypeUtilityService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_TYPE_UTILITY)
  create(
    @Body() createTypeUtilityDto: CreateTypeUtilityDto,
  ): Promise<TypeUtility> {
    return this.typeUtilityService.create(createTypeUtilityDto);
  }

  @Get()
  findAll(): Promise<TypeUtility[]> {
    return this.typeUtilityService.findAll();
  }

  @Get('hotel/:hotelId')
  @PermissionDecorator(EUserPermission.GET_TYPE_UTILITY)
  findByHotelId(@Param('hotelId') hotelId: number): Promise<TypeUtility[]> {
    return this.typeUtilityService.findByHotelId(hotelId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.GET_TYPE_UTILITY)
  findOne(@Param('id') id: number): Promise<TypeUtility> {
    return this.typeUtilityService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_TYPE_UTILITY)
  update(
    @Param('id') id: number,
    @Body() updateTypeUtilityDto: UpdateTypeUtilityDto,
  ): Promise<TypeUtility> {
    return this.typeUtilityService.update(id, updateTypeUtilityDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_TYPE_UTILITY)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.typeUtilityService.remove(id);
  }
}
