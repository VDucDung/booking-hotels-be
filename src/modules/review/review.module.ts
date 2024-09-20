import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { LocalesModule } from '../locales/locales.module';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), LocalesModule],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
