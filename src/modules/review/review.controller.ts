import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { LocalesService } from '../locales/locales.service';
import { REVIEW_MESSAGE } from 'src/messages';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly localesService: LocalesService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Review created successfully.',
    type: Review,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<{ message: string; data: Review }> {
    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.CREATE_REVIEW_SUCCESS,
      ),
      data: await this.reviewService.create(createReviewDto),
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

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID of the review to retrieve',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Review details.', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string; data: Review }> {
    return {
      message: this.localesService.translate(REVIEW_MESSAGE.GET_REVIEW_SUCCESS),
      data: await this.reviewService.findById(id),
    };
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID of the review to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully.',
    type: Review,
  })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<{ message: string; data: Review }> {
    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.UPDATE_REVIEW_SUCCESS,
      ),
      data: await this.reviewService.update(id, updateReviewDto),
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
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.reviewService.remove(id);

    return {
      message: this.localesService.translate(
        REVIEW_MESSAGE.DELETE_REVIEW_SUCCESS,
      ),
    };
  }
}
