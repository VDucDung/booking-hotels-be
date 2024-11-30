import {
  IsEnum,
  IsNotEmpty,
  IsDateString,
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  roomId: number;

  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  guestFullName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  option?: string[];

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsString()
  checkInTime: string;

  @IsString()
  checkOutTime: string;

  @IsOptional()
  @IsEnum(['cash', 'bank card', 'wallet'])
  paymentMethods: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'unpaid'])
  status?: string;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  stripePaymentIntentId?: string;

  @IsOptional()
  stripeTransferId?: string;
}
