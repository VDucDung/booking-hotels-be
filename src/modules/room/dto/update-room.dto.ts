import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import {
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';
import { TypeRoom } from 'src/modules/type_room/entities/type_room.entity';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'roomName',
    type: String,
    required: false,
    example: 'Updated Room Name',
  })
  roomName?: string;

  @IsOptional()
  @ApiProperty({
    name: 'description',
    type: String,
    required: false,
    example: 'Updated room description',
  })
  description?: string;

  @IsOptional()
  @IsArray({
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    name: 'images',
    type: [String],
    required: false,
    example: ['newImage1.jpg', 'newImage2.jpg'],
  })
  images?: string[];

  @IsOptional()
  @IsEnum(['1', '2', '3', '4', '5'], {
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    name: 'typeRoom',
    type: String,
    enum: ['1', '2', '3', '4', '5'],
    required: false,
    example: '2',
  })
  typeRoom?: string;

  @IsOptional()
  @IsArray({
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    name: 'option',
    type: [String],
    required: false,
    example: ['New Wi-Fi', 'Updated TV'],
  })
  option?: string[];

  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
    },
  )
  @ApiProperty({
    name: 'price',
    type: Number,
    required: false,
    example: 120,
  })
  price?: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
    },
  )
  @ApiProperty({
    name: 'typeRoomId',
    type: TypeRoom,
    required: false,
    example: 2,
  })
  typeRoomId: TypeRoom;
}
