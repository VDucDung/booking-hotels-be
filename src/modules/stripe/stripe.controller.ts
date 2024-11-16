import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-stripe.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import Stripe from 'stripe';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionService } from 'src/transactions/transactions.service';
import { TransactionStatus } from 'src/enums/transaction.enum';
import { UserService } from '../users/user.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  @Post('create-payment-intent')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createPaymentIntent(
    @UserDecorator() user: User,
    @Body() body: CreatePaymentIntentDto,
  ) {
    const { amount, currency } = body;
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount,
      currency,
      userId: user.id,
    });
    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('create-checkout-session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createCheckoutSession(
    @UserDecorator() user: User,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    const session = await this.stripeService.createCheckoutSession({
      amount: createCheckoutSessionDto.amount,
      userId: user.id,
    });
    return { sessionId: session.id };
  }

  @Post('webhook')
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
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        await this.userService.updateUserById(+userId, {
          balance: session.amount_total / 100,
        });
        await this.transactionService.updateTransactionStatus(
          +session.id,
          TransactionStatus.SUCCESS,
        );
        console.log(`Checkout Session completed: ${session.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return { received: true };
  }
}
