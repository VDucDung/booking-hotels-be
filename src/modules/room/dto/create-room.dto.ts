import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { COMMON_MESSAGE } from 'src/messages';
import { TypeRoom } from 'src/modules/type_room/entities/type_room.entity';

export class CreateRoomDto {
  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'roomName',
    type: String,
    required: true,
    example: 'Deluxe Room',
  })
  roomName: string;

  @IsOptional()
  @ApiProperty({
    name: 'description',
    type: String,
    required: false,
    example: 'Spacious room with a great view.',
  })
  description?: string;

  @IsArray({
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    name: 'images',
    type: [String],
    required: false,
    example: ['image1.jpg', 'image2.jpg'],
  })
  images: string[];

  @IsOptional()
  @IsArray({
    message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
  })
  @ApiProperty({
    name: 'option',
    type: [String],
    required: false,
    example: ['Wi-Fi', 'TV', 'Air Conditioner'],
  })
  option?: string[];

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage(COMMON_MESSAGE.INVALID),
    },
  )
  @ApiProperty({
    name: 'price',
    type: Number,
    required: true,
    example: 100,
  })
  price: number;

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @ApiProperty({
    name: 'typeRoomId',
    type: TypeRoom,
    required: true,
    example: 1,
  })
  typeRoomId: TypeRoom;

  @IsNotEmpty({
    message: i18nValidationMessage(COMMON_MESSAGE.NOT_EMPTY),
  })
  @IsOptional()
  @ApiProperty({
    name: 'partnerId',
    type: Number,
    required: true,
    example: 1,
  })
  partnerId: number;
}
