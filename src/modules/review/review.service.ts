import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/modules/review/entities/review.entity';
import { CreateReviewDto } from 'src/modules/review/dto/create-review.dto';
import { UpdateReviewDto } from 'src/modules/review/dto/update-review.dto';
import { ErrorHelper } from 'src/common/helpers';
import { REVIEW_MESSAGE } from 'src/messages';
import { UploadService } from '../uploads/upload.service';
import { imageDefault } from 'src/constants/image-default.constants';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    private readonly uploadService: UploadService,
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

    const review = this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find();
  }

  async findById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      ErrorHelper.NotFoundException(REVIEW_MESSAGE.REVIEW_NOT_FOUND);
    }
    return review;
  }

  async findByHotelId(hotelId: number): Promise<Review[]> {
    return await this.reviewRepository.find({ where: { hotelId } });
  }

  async findByUserId(userId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { userId },
    });
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    files: Array<Express.Multer.File>,
  ): Promise<Review> {
    const review = await this.findById(id);

    if (!review) {
      ErrorHelper.NotFoundException(REVIEW_MESSAGE.REVIEW_NOT_FOUND);
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
    return await this.reviewRepository.save(updatedReview);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findById(id);

    if (!review) {
      ErrorHelper.NotFoundException(REVIEW_MESSAGE.REVIEW_NOT_FOUND);
    }

    await this.reviewRepository.delete(id);
  }
}
