import { Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/common/helpers';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createCheckoutSession(
    amount: number,
  ): Promise<Stripe.Checkout.Session> {
    if (!amount || amount <= 0) {
      ErrorHelper.BadRequestException('Số tiền không hợp lệ.');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
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

      return session;
    } catch (error) {
      ErrorHelper.BadRequestException(error.message);
    }
  }
}
