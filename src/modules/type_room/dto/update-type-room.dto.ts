import { PartialType } from '@nestjs/swagger';
import { CreateTypeRoomDto } from './create-type-room.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';

export class UpdateTypeRoomDto extends PartialType(CreateTypeRoomDto) {
  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'name',
    type: String,
    example: 'Deluxe',
    required: false,
  })
  name?: string;

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

  @IsOptional()
  @ApiProperty({
    name: 'hotelId',
    type: Number,
    example: 1,
    required: false,
  })
  hotelId?: number;
}
