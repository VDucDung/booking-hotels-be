import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'Giới hạn số lượng kết quả trả về',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Từ khóa để tìm kiếm',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo trường cụ thể',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ngày nhận phòng',
  })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Ngày trả phòng',
  })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Số lượng phòng',
  })
  @IsOptional()
  totalRoom?: number;

  @ApiPropertyOptional({
    description: 'Sức chứa',
  })
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Giá phòng từ',
  })
  @IsOptional()
  startPrice?: number;

  @ApiPropertyOptional({
    description: 'Giá phòng đến',
  })
  @IsOptional()
  endPrice?: number;

  @ApiPropertyOptional({
    description: 'Đánh giá',
  })
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Địa điểm',
  })
  @IsOptional()
  address?: string;
}
