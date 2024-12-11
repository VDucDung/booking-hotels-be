import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PHONE_VN_REGEX } from 'src/constants';
import { COMMON_MESSAGE } from 'src/messages';

export class UpdateHotelDto {
  @IsOptional()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @ApiProperty({ name: 'hotelName', type: String, required: false })
  hotelName?: string;

  @IsOptional()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @ApiProperty({ name: 'address', type: String, required: false })
  address?: string;

  @IsOptional()
  @MaxLength(30, { message: i18nValidationMessage(COMMON_MESSAGE.MAX) })
  @Matches(PHONE_VN_REGEX, {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID_PHONE),
  })
  @ApiProperty({ name: 'contactPhone', type: String, required: false })
  contactPhone?: string;

  @IsOptional()
  @ApiProperty({ name: 'description', type: String, required: false })
  description?: string;

  @IsOptional()
  @ApiProperty({
    name: 'images',
    type: [String],
    required: false,
  })
  images?: string[];

  @IsOptional()
  files?: string[];

  @IsOptional()
  @IsNotEmpty({ message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY) })
  @ApiProperty({ name: 'favoriteId', type: Number, required: false })
  favoriteId?: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({ name: 'typeRoomIds', type: [Number], required: false })
  typeRoomIds?: number[];
}
