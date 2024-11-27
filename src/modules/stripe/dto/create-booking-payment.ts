import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from 'src/enums/ticket.enum';

export class CreateBookingPaymentDto {
  @IsNotEmpty()
  @IsString()
  ticketId: string;

  @IsNotEmpty()
  @IsNumber()
  hotelOwnerId: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  hotelStripeAccountId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  currency?: string;

  @IsNotEmpty()
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
