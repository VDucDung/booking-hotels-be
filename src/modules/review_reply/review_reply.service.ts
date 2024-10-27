import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewReply } from './entities/review_reply.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ErrorHelper } from 'src/common/helpers';
import { ReviewService } from '../review/review.service';
import { AUTH_MESSAGE } from 'src/messages';
import { LocalesService } from '../locales/locales.service';

@Injectable()
export class ReviewReplyService {
  constructor(
    @InjectRepository(ReviewReply)
    private reviewReplyRepository: Repository<ReviewReply>,
    private reviewService: ReviewService,
    private localesService: LocalesService,
  ) {}

  async create(createReplyDto: CreateReplyDto, userId: number) {
    const review = await this.reviewService.findById(createReplyDto.reviewId);

    if (userId !== review.hotelId.partner.id) {
      ErrorHelper.NotFoundException(
        this.localesService.translate(AUTH_MESSAGE.NO_PERMISSION),
      );
    }

    if (!review) {
      ErrorHelper.NotFoundException('Review not found');
    }

    const reply = this.reviewReplyRepository.create({
      content: createReplyDto.content,
      user: { id: userId },
      review,
    });

    return this.reviewReplyRepository.save(reply);
  }

  async findByReviewId(reviewId: number) {
    return this.reviewReplyRepository.find({
      where: { review: { id: reviewId }, deleted: false },
      relations: ['user'],
      select: {
        user: {
          id: true,
          fullname: true,
          avatar: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, content: string, userId: number) {
    const reply = await this.reviewReplyRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found or unauthorized');
    }

    reply.content = content;
    return this.reviewReplyRepository.save(reply);
  }

  async delete(id: number, userId: number) {
    const reply = await this.reviewReplyRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found or unauthorized');
    }

    reply.deleted = true;
    return this.reviewReplyRepository.save(reply);
  }
}
