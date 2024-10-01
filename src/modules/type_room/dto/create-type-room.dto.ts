import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';

export class CreateTypeRoomDto {
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'name',
    type: String,
    example: 'Deluxe',
    required: true,
  })
  name: string;

  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'description',
    type: String,
    example: 'A deluxe room with ocean view',
    required: false,
  })
  description?: string;

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'hotelId',
    type: Number,
    example: 1,
    required: true,
  })
  hotelId: number;
}