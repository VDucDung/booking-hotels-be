import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Review } from 'src/modules/review/entities/review.entity';
import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import { UpdateReviewDto } from 'src/modules/review/dto/update-review.dto';
import { ErrorHelper } from 'src/common/helpers';
import {
  AUTH_MESSAGE,
  HOTEL_MESSAGE,
  REVIEW_MESSAGE,
  USER_MESSAGE,
} from 'src/messages';
import { UploadService } from '../uploads/upload.service';
import { imageDefault } from 'src/constants/image-default.constants';
import { UserService } from '../users/user.service';
import { HotelService } from '../hotels/hotel.service';
import {
  PaginationInfo,
  ReviewFilterDto,
  ReviewResponse,
  ReviewStatistics,
} from 'src/interfaces/review.interface';
import { HasImages } from 'src/enums/review.enum';
import { LocalesService } from '../locales/locales.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    private readonly uploadService: UploadService,

    private readonly userService: UserService,

    private readonly hotelService: HotelService,

    private localesService: LocalesService,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    files: Array<Express.Multer.File>,
  ): Promise<Review> {
    let urls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.uploadService.uploadImage(file),
      );
      urls = await Promise.all(uploadPromises);
    } else {
      urls = [imageDefault];
    }

    createReviewDto.images = urls;

    const user = await this.userService.getUserById(createReviewDto.userId);

    if (!user) {
      ErrorHelper.NotFoundException(USER_MESSAGE.USER_NOT_FOUND);
    }
    const hotel = await this.hotelService.findOne(createReviewDto.hotelId);

    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId: user,
      hotelId: hotel,
    });

    await this.reviewRepository.save(review);
    delete review.userId;
    delete review.hotelId;
    return review;
  }

  async findRatingByPartnerId(user: User): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: {
        hotelId: {
          partner: {
            id: user.id,
          },
        },
      },
      relations: ['hotelId'],
      select: {
        hotelId: {
          id: true,
          hotelName: true,
        },
      },
    });
  }

  async updateReview(
    id: number,
    updateReviewDto: UpdateReviewDto,
    user: User,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['userId'],
    });

    if (!review) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(REVIEW_MESSAGE.REVIEW_NOT_FOUND),
      );
    }

    if (review.userId.id !== user.id) {
      ErrorHelper.UnauthorizedException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    const updateData: Partial<Review> = {
      ...(updateReviewDto.comment && { comment: updateReviewDto.comment }),
      ...(updateReviewDto.rating && { rating: updateReviewDto.rating }),
      ...(updateReviewDto.images && { images: updateReviewDto.images }),
    };

    const updatedReview = this.reviewRepository.merge(review, updateData);
    return this.reviewRepository.save(updatedReview);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find();
  }

  async findById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['hotelId', 'hotelId.partner'],
      select: {
        hotelId: {
          id: true,
          partner: {
            id: true,
          },
        },
      },
    });
    if (!review) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(REVIEW_MESSAGE.REVIEW_NOT_FOUND),
      );
    }
    return review;
  }

  async findByHotelId(filter: ReviewFilterDto): Promise<ReviewResponse> {
    const whereConditions: any = {
      hotelId: {
        id: filter.hotelId,
      },
    };

    if (filter.startDate || filter.endDate) {
      whereConditions.createdAt = {};
      if (filter.startDate) {
        whereConditions.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        whereConditions.createdAt.lte = filter.endDate;
      }
    }

    if (filter.hasImages !== HasImages.All) {
      if (filter.hasImages === HasImages.True) {
        whereConditions.images = Not(IsNull());
      } else if (filter.hasImages === HasImages.False) {
        whereConditions.images = IsNull();
      }
    }

    const total = await this.reviewRepository.count({
      where: whereConditions,
    });

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const reviews = await this.reviewRepository.find({
      where: whereConditions,
      relations: ['userId', 'replies', 'replies.user'],
      select: {
        userId: {
          id: true,
          fullname: true,
          avatar: true,
        },
        replies: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
      order: {
        createdAt: filter.sortByCreatedAt || 'DESC',
      },
      skip,
      take: limit,
    });

    const allReviews = await this.reviewRepository.find({
      where: whereConditions,
      select: ['rating'],
    });

    const statistics: ReviewStatistics = {
      averageRating: 0,
      totalReviews: allReviews.length,
      ratingDistribution: {
        oneStar: 0,
        twoStars: 0,
        threeStars: 0,
        fourStars: 0,
        fiveStars: 0,
      },
    };

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      statistics.averageRating = Number(
        (totalRating / allReviews.length).toFixed(1),
      );

      allReviews.forEach((review) => {
        const ratingKey = {
          1: 'oneStar',
          2: 'twoStars',
          3: 'threeStars',
          4: 'fourStars',
          5: 'fiveStars',
        }[review.rating] as keyof typeof statistics.ratingDistribution;

        if (ratingKey) {
          statistics.ratingDistribution[ratingKey]++;
        }
      });
    }

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      total,
      page,
      limit,
      totalPages,
    };

    return {
      reviews,
      statistics,
      pagination,
    };
  }
  async findByUserId(userId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: {
        userId: {
          id: userId,
        },
      },
    });
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    files: Array<Express.Multer.File>,
  ): Promise<Review> {
    const review = await this.findById(id);

    if (!review) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(REVIEW_MESSAGE.REVIEW_NOT_FOUND),
      );
    }

    let urls: string[] = review.images;

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.uploadService.uploadImage(file),
      );
      urls = await Promise.all(uploadPromises);
    } else {
      urls = [imageDefault];
    }

    const updatedReview = { ...review, ...updateReviewDto };
    updatedReview.images = urls;

    const user = await this.userService.getUserById(
      updatedReview.userId as number,
    );

    if (!user) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(USER_MESSAGE.USER_NOT_FOUND),
      );
    }

    const hotel = await this.hotelService.findOne(
      updatedReview.hotelId as number,
    );

    if (hotel) {
      ErrorHelper.NotFoundException(HOTEL_MESSAGE.HOTEL_NOT_FOUND);
    }

    return await this.reviewRepository.save({
      ...updateReviewDto,
      userId: user,
      hotelId: hotel,
    });
  }

  async remove(id: number, user: User): Promise<void> {
    const review = await this.findById(id);
    if (review.hotelId.partner.id !== user.id) {
      ErrorHelper.ForbiddenException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    await this.reviewRepository.delete(id);
  }
}
