import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { ERole, EUserPermission } from 'src/enums/roles.enum';

@ApiTags('hotels')
@ApiBearerAuth()
@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  @AuthDecorator([ERole.PARTNER])
  @PermissionDecorator(EUserPermission.CREATE_HOTEL)
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

  @Get()
  findAll() {
    return this.hotelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.hotelService.findOne(id);
  }

  @Put(':id')
  @AuthDecorator([ERole.PARTNER])
  @PermissionDecorator(EUserPermission.UPDATE_HOTEL)
  update(@Param('id') id: number, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @AuthDecorator([ERole.PARTNER])
  @PermissionDecorator(EUserPermission.DELETE_HOTEL)
  remove(@Param('id') id: number) {
    return this.hotelService.remove(id);
  }
}
