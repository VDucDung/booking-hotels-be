import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';
import { Review } from 'src/modules/review/entities/review.entity';

export class CreateHotelDto {
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'hotelName',
    type: String,
    required: true,
  })
  hotelName: string;

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'address',
    type: String,
    required: true,
  })
  address: string;

  @IsOptional()
  @ApiProperty({
    name: 'description',
    type: String,
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsArray({
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    name: 'images',
    type: [String],
    required: true,
  })
  images: string[];

  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'favoriteId',
    type: Number,
    required: false,
  })
  favoriteId: number;

  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'reviews',
    type: [Review],
    required: false,
  })
  reviews?: Review[];

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'typeRoomIds',
    type: [Number],
    required: true,
  })
  typeRoomIds: number[];
}
