import { PaymentMethod } from 'src/enums/ticket.enum';
import { User } from 'src/modules/users/entities/user.entity';

export interface ProcessBookingPaymentParams {
  ticketId: string;
  user: User;
  hotelOwnerId: number;
  amount: number;
  currency?: string;
  hotelStripeAccountId?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}
