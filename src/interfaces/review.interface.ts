import { HasImages } from 'src/enums/review.enum';
import { Review } from 'src/modules/review/entities/review.entity';

export type sortByType = 'ASC' | 'DESC';

export interface ReviewFilterDto {
  hotelId: number;
  startDate?: Date;
  endDate?: Date;
  hasImages?: HasImages;
  sortByCreatedAt?: sortByType;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    oneStar: number;
    twoStars: number;
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
}

export interface ReviewResponse {
  reviews: Review[];
  statistics: ReviewStatistics;
}

export interface ReviewResponse {
  reviews: Review[];
  statistics: ReviewStatistics;
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
