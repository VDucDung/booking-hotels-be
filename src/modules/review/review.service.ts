import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/modules/review/entities/review.entity';
import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import { UpdateReviewDto } from 'src/modules/review/dto/update-review.dto';
import { ErrorHelper } from 'src/common/helpers';
import { REVIEW_MESSAGE } from 'src/messages';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find();
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      ErrorHelper.NotFoundException(REVIEW_MESSAGE.REVIEW_NOT_FOUND);
    }
    return review;
  }

  async findByHotelId(hotelId: string): Promise<Review[]> {
    return await this.reviewRepository.find({ where: { hotelId } });
  }

  async findByUserId(userId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findById(id);

    if (!review) {
      ErrorHelper.NotFoundException(REVIEW_MESSAGE.REVIEW_NOT_FOUND);
    }

    const updatedReview = { ...review, ...updateReviewDto };
    return await this.reviewRepository.save(updatedReview);
  }

  async remove(id: string): Promise<void> {
    const review = await this.findById(id);

    if (!review) {
      ErrorHelper.NotFoundException(REVIEW_MESSAGE.REVIEW_NOT_FOUND);
    }

    await this.reviewRepository.delete(id);
  }
}
