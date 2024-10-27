import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { HasImages, SortOrder } from 'src/enums/review.enum';

export class ReviewFilterDto {
  @ApiProperty({
    enum: SortOrder,
    required: false,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortByCreatedAt?: SortOrder;

  @ApiProperty({
    enum: HasImages,
    required: false,
  })
  @IsEnum(HasImages)
  @IsOptional()
  hasImages?: HasImages;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
