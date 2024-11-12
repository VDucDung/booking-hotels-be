import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  amount: number;
}
