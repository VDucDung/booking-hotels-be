import { IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(12000)
  amount: number;

  @IsString()
  currency: string;
}
