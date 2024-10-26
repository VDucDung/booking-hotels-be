export type sortByType = 'ASC' | 'DESC';

export interface ReviewFilterDto {
  hotelId: number;
  startDate?: Date;
  endDate?: Date;
  hasImages?: boolean;
  sortByCreatedAt?: sortByType;
}

export interface ReviewStatistics {
  averageRating: number;
  ratingDistribution: {
    oneStar: number;
    twoStars: number;
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
}

export interface ReviewResponse {
  reviews: any[];
  statistics: ReviewStatistics;
}
