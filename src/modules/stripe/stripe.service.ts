import { Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionType } from 'src/enums/transaction.enum';
import { TransactionService } from 'src/transactions/transactions.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly transactionService: TransactionService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    });
  }

  constructEvent(payload: Buffer, sig: string, secret: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, sig, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      ErrorHelper.BadRequestException('Webhook signature verification failed');
    }
  }

  async createPaymentIntent({
    amount,
    currency,
    userId,
  }: {
    amount: number;
    currency: string;
    userId: number;
  }): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
    await this.transactionService.createTransaction({
      userId,
      amount,
      type: TransactionType.DEPOSIT,
      stripePaymentIntentId: paymentIntent.id,
    });

    return paymentIntent;
  }

  async createCheckoutSession({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<Stripe.Checkout.Session> {
    if (!amount || amount < 12000) {
      ErrorHelper.BadRequestException(
        'Số tiền không hợp lệ. Số tiền tối thiểu là ₫12,000.',
      );
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        client_reference_id: `${userId}`,
        line_items: [
          {
            price_data: {
              currency: 'vnd',
              product_data: {
                name: 'Nạp tiền StayBuddy',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      });

      await this.transactionService.createTransaction({
        userId,
        amount,
        type: TransactionType.DEPOSIT,
        stripeSessionId: session.id,
      });

      return session;
    } catch (error) {
      ErrorHelper.InternalServerErrorException(
        'Không thể tạo phiên thanh toán. Vui lòng thử lại.',
      );
    }
  }
}
