import { Controller, Post, Req, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { TransactionService } from 'src/transactions/transactions.service';
import { Stripe } from 'stripe';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionStatus } from 'src/enums/transaction.enum';

@Controller('stripe/webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') sig: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      ErrorHelper.InternalServerErrorException(
        'Webhook signature verification failed.',
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.transactionService.updateTransactionStatus(
          +paymentIntent.id,
          TransactionStatus.SUCCESS,
        );
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.transactionService.updateTransactionStatus(
          +session.id,
          TransactionStatus.SUCCESS,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return { received: true };
  }
}
