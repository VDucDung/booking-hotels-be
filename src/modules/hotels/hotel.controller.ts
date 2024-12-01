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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { ERole, EUserPermission } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { QueryParamsDto } from './dto/query-params.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../uploads/options/multer.option';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { Hotel } from './entities/hotel.entity';
import { LocalesService } from '../locales/locales.service';
import { HOTEL_MESSAGE } from 'src/messages';

@ApiTags('hotels')
@Controller('hotels')
export class HotelController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @PermissionDecorator(EUserPermission.CREATE_HOTEL)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        hotelName: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        typeRooms: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions.fileFilter))
  create(
    @UserDecorator() user: any,
    @Body() createHotelDto: CreateHotelDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.hotelService.create(user, createHotelDto, files);
  }

  @Get()
  findAll(@Query() queryParams: QueryParamsDto) {
    return this.hotelService.findAll(queryParams);
  }

  @Get('search')
  async searchHotels(@Query() queryParams: QueryParamsDto): Promise<{
    message: string;
    data: { hotels: Hotel[]; detailResult: any };
  }> {
    const {
      limit,
      page,
      keyword,
      sortBy,
      startDate,
      endDate,
      totalRoom,
      capacity,
      startPrice,
      endPrice,
      rating,
      address,
    } = queryParams;
    const sanitizedLimit = limit && !isNaN(limit) && limit > 0 ? limit : 10;
    const sanitizedPage = page && !isNaN(page) && page > 0 ? page : 1;
    const { data, detailResult } = await this.hotelService.searchHotels(
      sanitizedLimit,
      sanitizedPage,
      keyword,
      sortBy,
      startDate,
      endDate,
      totalRoom,
      capacity,
      startPrice,
      endPrice,
      rating,
      address,
    );
    return {
      message: this.localesService.translate(HOTEL_MESSAGE.GET_HOTELS_SUCCESS),
      data: { hotels: data, detailResult },
    };
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
