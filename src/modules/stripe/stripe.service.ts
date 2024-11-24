import { Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionType } from 'src/enums/transaction.enum';
import { TransactionService } from 'src/transactions/transactions.service';
import Stripe from 'stripe';
import { TicketService } from '../tickets/ticket.service';
import { User } from '../users/entities/user.entity';
import { PaymentMethod } from 'src/enums/ticket.enum';
import { UserService } from '../users/user.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
  ) {
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

  async createBookingPaymentIntent({
    ticketId,
    user,
    hotelOwnerId,
    amount,
    currency = 'vnd',
  }: {
    ticketId: string;
    user: User;
    hotelOwnerId: number;
    amount: number;
    currency?: string;
  }): Promise<Stripe.PaymentIntent> {
    const hotelOwner = await this.userService.getUserById(hotelOwnerId);

    if (!hotelOwner || !hotelOwner.stripeAccountId) {
      ErrorHelper.NotFoundException(
        'Hotel owner does not have a connected Stripe account',
      );
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      transfer_group: `booking_${hotelOwnerId}`,
    });

    const transfer = await this.stripe.transfers.create({
      amount: Math.floor(amount * 0.9),
      currency,
      destination: hotelOwner.stripeAccountId,
      transfer_group: `booking_${hotelOwnerId}`,
    });

    await this.ticketService.update(ticketId, user, {
      amount,
      paymentMethods: PaymentMethod.BANK_CARD,
      stripePaymentIntentId: paymentIntent.id,
      stripeTransferId: transfer.id,
    });

    return paymentIntent;
  }

  async createConnectedAccount(user: User) {
    if (user.stripeAccountId) {
      return {
        message: 'User already has a Stripe Connected Account',
        stripeAccountId: user.stripeAccountId,
      };
    }

    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await this.userService.updateStripeAccountId(user.id, account.id);

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL_ACCOUNT}/refresh`,
      return_url: `${process.env.FRONTEND_URL_ACCOUNT}/success`,
      type: 'account_onboarding',
    });

    return {
      message: 'Stripe account created successfully',
      stripeAccountId: account.id,
      onboardingUrl: accountLink.url,
    };
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
