import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum HasImages {
  True = 'true',
  False = 'false',
}

export class GetReviewDto {
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
}
