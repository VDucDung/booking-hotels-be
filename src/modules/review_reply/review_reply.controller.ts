import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ReviewReplyService } from './review_reply.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ERole } from 'src/enums/roles.enum';

@Controller('review-replies')
@ApiTags('ReviewReplies')
export class ReviewReplyController {
  constructor(private readonly reviewReplyService: ReviewReplyService) {}

  @UseGuards(AuthGuard)
  @AuthDecorator([ERole.PARTNER, ERole.ADMIN])
  @ApiBearerAuth()
  @Post()
  create(
    @Body() createReplyDto: CreateReplyDto,
    @UserDecorator('id') userId: number,
  ) {
    return this.reviewReplyService.create(createReplyDto, userId);
  }

  @Get('review/:reviewId')
  findByReviewId(@Param('reviewId') reviewId: number) {
    return this.reviewReplyService.findByReviewId(reviewId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateReplyDto: UpdateReplyDto,
    @UserDecorator('id') userId: number,
  ) {
    return this.reviewReplyService.update(id, updateReplyDto.content, userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  delete(@Param('id') id: number, @UserDecorator('id') userId: number) {
    return this.reviewReplyService.delete(id, userId);
  }
}
