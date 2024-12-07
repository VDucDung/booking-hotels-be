import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { LocalesService } from '../locales/locales.service';
import { REVIEW_MESSAGE } from 'src/messages';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { EUserPermission } from 'src/enums/roles.enum';
import { PermissionDecorator } from 'src/common/decorators/permission.decorator';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../uploads/options/multer.option';
import { HasImages } from 'src/enums/review.enum';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @PermissionDecorator(EUserPermission.CREATE_REVIEW)
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
        comment: {
          type: 'string',
        },
        hotelId: {
          type: 'number',
        },
        rating: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions.fileFilter))
  async create(
    @UserDecorator() user: any,
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    createReviewDto.userId = user.id;
    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.CREATE_REVIEW_SUCCESS,
      ),
      data: await this.reviewService.create(createReviewDto, files),
    };
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of reviews.', type: [Review] })
  @ApiResponse({ status: 404, description: 'No reviews found.' })
  async findAll(): Promise<{ message: string; data: Review[] }> {
    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.GET_LIST_REVIEW_SUCCESS,
      ),
      data: await this.reviewService.findAll(),
    };
  }

  @Get('hotel/:hotelId')
  async getReviewByHotelId(
    @Param('hotelId') hotelId: number,
    @Query() filter: ReviewFilterDto,
  ): Promise<{ message: string; data: any }> {
    return {
      message: this.localesService.translate(REVIEW_MESSAGE.GET_REVIEW_SUCCESS),
      data: await this.reviewService.findByHotelId({
        hotelId: hotelId,
        sortByCreatedAt: filter.sortByCreatedAt,
        hasImages:
          filter.hasImages === undefined || filter.hasImages === 'all'
            ? HasImages.All
            : (filter.hasImages as HasImages),
        startDate: filter.startDate,
        endDate: filter.endDate,
        page: filter.page,
        limit: filter.limit,
      }),
    };
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID of the review to retrieve',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Review details.', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findOne(
    @Param('id') id: number,
  ): Promise<{ message: string; data: Review }> {
    return {
      message: this.localesService.translate(REVIEW_MESSAGE.GET_REVIEW_SUCCESS),
      data: await this.reviewService.findById(id),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @PermissionDecorator(EUserPermission.CREATE_REVIEW)
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
        comment: {
          type: 'string',
        },
        hotelId: {
          type: 'number',
        },
        rating: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions.fileFilter))
  async update(
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<{ message: string; data: Review }> {
    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.UPDATE_REVIEW_SUCCESS,
      ),
      data: await this.reviewService.update(id, updateReviewDto, files),
    };
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID of the review to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async remove(
    @Param('id') id: number,
    @UserDecorator() user: User,
  ): Promise<{ message: string }> {
    await this.reviewService.remove(id, user);

    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.DELETE_REVIEW_SUCCESS,
      ),
    };
  }
}
