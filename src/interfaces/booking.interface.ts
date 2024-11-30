import { TransactionType } from 'src/enums/transaction.enum';
import { User } from 'src/modules/users/entities/user.entity';

export interface ProcessBookingPaymentParams {
  ticketId: string;
  user: User;
  hotelOwnerId: number;
  paymentMethod: TransactionType;
}

export interface PaymentResult {
  success: boolean;
  message: string;
}
