import { Injectable, Logger } from '@nestjs/common';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionType } from 'src/enums/transaction.enum';
import { TransactionService } from 'src/modules/transactions/transactions.service';
import Stripe from 'stripe';
import { TicketService } from '../tickets/ticket.service';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
import {
  PaymentResult,
  ProcessBookingPaymentParams,
} from 'src/interfaces/booking.interface';
import { TicketStatus } from 'src/enums/ticket.enum';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

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

  async createBookingPaymentIntent({
    ticketId,
    user,
    hotelOwnerId,
    amount,
    currency = 'vnd',
    paymentMethod,
    hotelStripeAccountId,
  }: {
    ticketId: string;
    user: User;
    hotelOwnerId: number;
    amount: number;
    currency?: string;
    paymentMethod: TransactionType;
    hotelStripeAccountId?: string;
  }): Promise<Stripe.PaymentIntent> {
    if (amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    const stripeAccountId =
      hotelStripeAccountId ||
      (await this.getHotelOwnerStripeAccount(hotelOwnerId));

    if (!stripeAccountId) {
      throw new Error('Hotel Stripe account not found');
    }

    try {
      if (!user.stripeCustomerId) {
        const customer = await this.stripe.customers.create({
          name: user.fullname,
          email: user.email,
        });

        user.stripeCustomerId = customer.id;
        await this.userService.updateUserById(user.id, {
          stripeCustomerId: user.stripeCustomerId,
        });
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: user.stripeCustomerId,
        transfer_data: { destination: stripeAccountId },
        transfer_group: `booking_${stripeAccountId}`,
      });

      await this.transactionService.createTransaction({
        userId: user.id,
        amount,
        type: paymentMethod,
        ticketId,
        stripePaymentIntentId: paymentIntent.id,
      });

      await this.ticketService.update(ticketId, user, {
        amount,
        paymentMethods: paymentMethod,
        stripePaymentIntentId: paymentIntent.id,
      });

      this.logger.log(`Payment intent created for ticket ${ticketId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Error creating booking payment intent', error);
      throw new Error('Failed to create booking payment intent');
    }
  }

  async processBookingPayment({
    ticketId,
    user,
    hotelOwnerId,
    paymentMethod,
  }: ProcessBookingPaymentParams): Promise<PaymentResult> {
    if (!ticketId || !user || !hotelOwnerId) {
      throw new Error('Invalid payment parameters');
    }
    const userBalance = await this.userService.getUserBalance(user.id);

    const partner = await this.userService.findOne({
      where: { id: hotelOwnerId },
    });
    const ticket = await this.ticketService.findOne(ticketId);

    if (userBalance >= ticket.amount) {
      await this.userService.decreaseBalance(user.id, ticket.amount);

      await this.userService.increaseBalance(partner.id, ticket.amount);

      await this.ticketService.update(ticket.id, partner, {
        status: TicketStatus.PAID,
        paymentMethods: paymentMethod,
      });

      await this.transactionService.createTransaction({
        userId: user.id,
        amount: ticket.amount,
        type: paymentMethod,
        ticketId,
      });

      return {
        success: true,
        message: 'Payment processed successfully',
      };
    } else {
      return {
        success: false,
        message: 'Insufficient balance. Please choose another payment method',
      };
    }
  }

  private async getHotelOwnerStripeAccount(
    hotelOwnerId: number,
  ): Promise<string> {
    if (!hotelOwnerId) {
      throw new Error('Hotel owner ID is required');
    }

    const hotelOwner = await this.userService.getUserById(hotelOwnerId);

    if (!hotelOwner || !hotelOwner.stripeAccountId) {
      throw new Error('Hotel owner does not have a connected Stripe account');
    }

    return hotelOwner.stripeAccountId;
  }
  async createConnectedAccount(user: User) {
    try {
      if (user.stripeAccountId) {
        const accountStatus = await this.retrieveAccountStatus(
          user.stripeAccountId,
        );

        return {
          message: 'User already has a Stripe Connected Account',
          stripeAccountId: user.stripeAccountId,
          accountStatus,
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
        metadata: {
          userId: user.id.toString(),
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
    } catch (error) {
      console.error('Error creating connected account:', error);
      ErrorHelper.InternalServerErrorException(
        'Failed to create Stripe connected account',
      );
    }
  }

  async getDashboardLink(userId: number) {
    const account = await this.userService.getUserById(userId);

    const loginLink = await this.stripe.accounts.createLoginLink(
      account.stripeAccountId,
    );

    return loginLink.url;
  }

  async generateAccountLink(accountId: string) {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.FRONTEND_URL}/settings/payments/refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings/payments/success`,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      console.error('Error generating account link:', error);
      ErrorHelper.InternalServerErrorException(
        'Failed to generate account link',
      );
    }
  }

  async retrieveAccountStatus(accountId: string) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);

      return {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: {
          currentlyDue: account.requirements?.currently_due,
          pendingVerification: account.requirements?.pending_verification,
        },
      };
    } catch (error) {
      console.error('Error retrieving account status:', error);
      ErrorHelper.InternalServerErrorException(
        'Failed to retrieve account status',
      );
    }
  }

  async deleteStripeAccount(user: any) {
    try {
      const deletedAccount = await this.stripe.accounts.del(
        user.stripeAccountId,
      );

      await this.userService.updateUserById(user.id, {
        stripeAccountId: null,
      });

      return deletedAccount;
    } catch (error) {
      throw new Error('Error deleting Stripe account: ' + error.message);
    }
  }

  async handleConnectWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'account.updated': {
          const account = event.data.object as Stripe.Response<Stripe.Account>;
          const userId = account.metadata?.userId;

          if (userId) {
            await this.userService.updateStripeAccountStatus(parseInt(userId), {
              isStripeVerified:
                account.details_submitted && account.charges_enabled,
              stripeAccountStatus: {
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
              },
            });

            console.log('Updated account status for user:', {
              userId,
              accountId: account.id,
              status:
                account.details_submitted && account.charges_enabled
                  ? 'verified'
                  : 'pending',
            });
          }
          break;
        }

        case 'account.application.deauthorized': {
          const application = event.data.object as Stripe.Application;

          const accountId = event.account;

          if (accountId) {
            const account = await this.stripe.accounts.retrieve(accountId);
            const userId = account.metadata?.userId;

            if (userId) {
              await this.userService.removeStripeAccount(parseInt(userId));

              console.log('Removed Stripe account for user:', {
                userId,
                accountId,
                applicationId: application.id,
              });
            }
          }
          break;
        }

        case 'capability.updated': {
          const capability = event.data.object as Stripe.Capability;
          const accountId = event.account;

          if (accountId) {
            const account = await this.stripe.accounts.retrieve(accountId);
            const userId = account.metadata?.userId;

            if (userId) {
              await this.userService.updateStripeAccountStatus(
                parseInt(userId),
                {
                  isStripeVerified:
                    account.details_submitted && account.charges_enabled,
                  stripeAccountStatus: {
                    chargesEnabled: account.charges_enabled,
                    payoutsEnabled: account.payouts_enabled,
                    detailsSubmitted: account.details_submitted,
                  },
                },
              );

              console.log('Updated account capability for user:', {
                userId,
                accountId,
                capability: capability.id,
                status: capability.status,
              });
            }
          }
          break;
        }

        default: {
          console.log(`Unhandled event type: ${event.type}`);
        }
      }
    } catch (error) {
      console.error('Error handling webhook event:', {
        eventType: event.type,
        error: error.message,
      });
      ErrorHelper.InternalServerErrorException(
        `Failed to handle webhook event: ${event.type}`,
      );
    }
  }

  async checkAccountStatus(accountId: string) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);

      return {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements,
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      throw error;
    }
  }

  async createTransfer({
    amount,
    currency = 'vnd',
    destinationAccountId,
    transferGroup,
  }: {
    amount: number;
    currency?: string;
    destinationAccountId: string;
    transferGroup: string;
  }) {
    try {
      const platformFee = amount; // Math.floor(amount * 0.1)
      const transferAmount = amount - platformFee;

      const transfer = await this.stripe.transfers.create({
        amount: transferAmount,
        currency,
        destination: destinationAccountId,
        transfer_group: transferGroup,
      });

      return transfer;
    } catch (error) {
      console.error('Error creating transfer:', error);
      ErrorHelper.InternalServerErrorException('Failed to create transfer');
    }
  }
  async createCheckoutSession({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<Stripe.Checkout.Session> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!amount || amount < 12000) {
      throw new Error('Invalid amount. Minimum deposit is ₫12,000.');
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

      this.logger.log(`Checkout session created for user ${userId}`);
      return session;
    } catch (error) {
      this.logger.error('Error creating checkout session', error);
      throw new Error('Failed to create payment session');
    }
  }
}
