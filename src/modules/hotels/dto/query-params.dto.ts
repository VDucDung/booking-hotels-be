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
}
