import { IsEnum, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  roomId: string;

  @IsDateString()
  checkInDate: Date;

  @IsDateString()
  checkOutDate: Date;

  @IsEnum(['Cash', 'Bank Transfer', 'Gift Card'])
  paymentMethods: string;

  @IsEnum(['pending', 'done', 'reject'])
  status: string;
}
