import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class OptionDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  feature: string;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  availability: boolean;
}

export class UpdateRoomDto {
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    name: 'roomName',
    type: String,
    required: false,
  })
  roomName?: string;

  @IsOptional()
  @ApiProperty({
    name: 'description',
    type: String,
    required: false,
  })
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
  options?: OptionDto[];

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: 'price',
    type: Number,
    required: false,
  })
  price?: number;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    name: 'typeRoomId',
    type: Number,
    required: false,
  })
  typeRoomId?: number;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    name: 'partnerId',
    type: Number,
    required: false,
  })
  partnerId?: number;

  @IsNotEmpty()
  @IsOptional()
  capacity: number;
}
