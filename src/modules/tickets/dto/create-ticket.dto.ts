import { IsEnum, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  roomId: number;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsEnum(['Cash', 'Bank Transfer', 'Gift Card'])
  paymentMethods: string;
}
