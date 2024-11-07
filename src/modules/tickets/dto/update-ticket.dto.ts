import { IsEnum, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class UpdateTicketDto {
  @IsNotEmpty()
  @IsOptional()
  roomId: number;

  @IsDateString()
  @IsOptional()
  checkInDate: string;

  @IsDateString()
  @IsOptional()
  checkOutDate: string;

  @IsEnum(['Cash', 'Bank Transfer', 'Gift Card'])
  @IsOptional()
  paymentMethods: string;

  @IsEnum(['pending', 'done', 'reject'])
  @IsOptional()
  status: string;
}
