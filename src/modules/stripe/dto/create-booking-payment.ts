import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionType } from 'src/enums/transaction.enum';

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
  @IsOptional()
  amount?: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  currency?: string;

  @IsNotEmpty()
  paymentMethod: TransactionType;
}
