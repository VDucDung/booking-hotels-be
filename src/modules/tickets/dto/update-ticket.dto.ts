import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsEmail,
  IsArray,
} from 'class-validator';
import { PaymentMethod, TicketStatus } from 'src/enums/ticket.enum';

export class UpdateTicketDto {
  @IsOptional()
  roomId?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  guestFullName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  option?: string[];

  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethods?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: string;

  @IsOptional()
  amount?: number;

  @IsOptional()
  stripePaymentIntentId?: string;

  @IsOptional()
  stripeTransferId?: string;
}
