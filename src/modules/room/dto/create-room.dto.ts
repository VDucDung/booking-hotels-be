import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class OptionDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  feature: string;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  availability: boolean;
}

export class CreateRoomDto {
  @IsNotEmpty()
  @ApiProperty({
    name: 'roomName',
    type: String,
    required: true,
  })
  roomName: string;

  @IsOptional()
  @ApiProperty({
    name: 'description',
    type: String,
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    name: 'images',
    type: [String],
    required: false,
  })
  images: string[];

  @IsOptional()
  options?: OptionDto[];

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    name: 'price',
    type: Number,
    required: true,
  })
  price: number;

  @IsNotEmpty()
  @ApiProperty({
    name: 'typeRoomId',
    type: Number,
    required: true,
  })
  typeRoomId: number;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    name: 'partnerId',
    type: Number,
    required: true,
  })
  partnerId: number;

  @IsNotEmpty()
  capacity: number;
}
