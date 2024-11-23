import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsEmail,
  IsArray,
} from 'class-validator';

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
  @IsEnum(['cash', 'null', 'bank card'])
  paymentMethods?: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'unpaid'])
  status?: string;
}
