import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type decorator

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'Giới hạn số lượng kết quả trả về',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number) // Chuyển đổi từ chuỗi sang số
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  @Type(() => Number) // Chuyển đổi từ chuỗi sang số
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Từ khóa để tìm kiếm',
    example: 'hotel name',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo trường cụ thể',
    example: 'name:asc',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
}
