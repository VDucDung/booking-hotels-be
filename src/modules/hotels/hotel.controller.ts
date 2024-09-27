import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { ERole, EUserPermission } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { QueryParamsDto } from './dto/query-params.dto';

@ApiTags('hotels')
@ApiBearerAuth()
@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_HOTEL)
  create(@Request() req, @Body() createHotelDto: CreateHotelDto) {
    createHotelDto.partnerId = req.user.id;
    return this.hotelService.create(createHotelDto);
  }

  @Get()
  findAll(@Query() queryParams: QueryParamsDto) {
    return this.hotelService.findAll(queryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.hotelService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.UPDATE_HOTEL)
  update(
    @Param('id') id: number,
    @Body() updateHotelDto: UpdateHotelDto,
    @Request() req,
  ) {
    return this.hotelService.update(id, updateHotelDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.DELETE_HOTEL)
  remove(@Param('id') id: number, @Request() req) {
    return this.hotelService.remove(id, req.user);
  }
}
