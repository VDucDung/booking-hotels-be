import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  Get,
  Delete,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-stripe.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import Stripe from 'stripe';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionService } from 'src/modules/transactions/transactions.service';
import { TransactionStatus } from 'src/enums/transaction.enum';
import { UserService } from '../users/user.service';
import { TicketService } from '../tickets/ticket.service';
import { TicketStatus } from 'src/enums/ticket.enum';
import { CreateBookingPaymentDto } from './dto/create-booking-payment';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
  ) {}

  @Post('/create-booking-payment')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createBookingPayment(
    @UserDecorator() user: User,
    @Body() body: CreateBookingPaymentDto,
  ) {
    try {
      return await this.stripeService.createBookingPaymentIntent({
        ticketId: body.ticketId,
        user,
        hotelOwnerId: body.hotelOwnerId,
        hotelStripeAccountId: body.hotelStripeAccountId,
        amount: body.amount,
        currency: body.currency,
        paymentMethod: body.paymentMethod,
      });
    } catch (error) {
      this.logger.error('Booking payment creation failed', error);
      throw error;
    }
  }

  @Post('/process-booking-payment')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async processBookingPayment(
    @UserDecorator() user: User,
    @Body() body: CreateBookingPaymentDto,
  ) {
    const result = await this.stripeService.processBookingPayment({
      ticketId: body.ticketId,
      user,
      hotelOwnerId: body.hotelOwnerId,
      paymentMethod: body.paymentMethod,
    });

    return {
      statusCode: result.success ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST,
      message: result.message,
    };
  }

  @Post('/create-stripe-account')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createStripeAccount(@UserDecorator() user: User) {
    return this.stripeService.createConnectedAccount(user);
  }

  @Get('get-dashboard-link')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getDashboardLink(@UserDecorator() user: User) {
    return await this.stripeService.getDashboardLink(user.id);
  }

  @Get('account-status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getAccountStatus(@UserDecorator() user: User) {
    if (!user.stripeAccountId) {
      return { connected: false };
    }
    return this.stripeService.retrieveAccountStatus(user.stripeAccountId);
  }

  @Post('account-link')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async generateAccountLink(@UserDecorator() user: User) {
    if (!user.stripeAccountId) {
      ErrorHelper.BadRequestException('No Stripe account found');
    }
    return this.stripeService.generateAccountLink(user.stripeAccountId);
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

  @Delete('delete-account')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async deleteAccount(@UserDecorator() user: User) {
    if (!user.stripeAccountId) {
      ErrorHelper.BadRequestException('No Stripe account found');
    }

    try {
      const deletedAccount = await this.stripeService.deleteStripeAccount(user);

      return { message: 'Stripe account deleted successfully', deletedAccount };
    } catch (error) {
      ErrorHelper.InternalServerErrorException('Error deleting Stripe account');
    }
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') sig: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      this.logger.error('Stripe webhook secret is not configured');
      throw new Error('Webhook configuration missing');
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      this.logger.error('Webhook event verification failed', error);
      throw error;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}`, error);
      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const { transfer_data } = paymentIntent;

    if (!transfer_data || !transfer_data.destination) {
      this.logger.error(
        `Invalid transfer data in payment intent: ${paymentIntent.id}`,
      );
      throw new Error('Invalid transfer data.');
    }

    try {
      await this.transactionService.updatePaymentTransactionStatus(
        paymentIntent.id,
        TransactionStatus.SUCCESS,
      );

      await this.ticketService.updateTicketStatus(
        paymentIntent.id,
        TicketStatus.PAID,
      );

      this.logger.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(
        `Error handling payment intent ${paymentIntent.id}:`,
        error,
      );
      throw new Error(`Failed to process payment intent ${paymentIntent.id}`);
    }
  }

  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    const user = await this.userService.getUserById(+userId);

    if (!user) {
      this.logger.error(`User not found for session: ${session.id}`);
      throw new Error('User not found');
    }

    const newBalance = (user.balance || 0) + (session.amount_total || 0);

    await this.userService.updateUserById(+userId, {
      balance: newBalance,
    });

    await this.transactionService.updateTransactionStatus(
      session.id,
      TransactionStatus.SUCCESS,
    );

    await this.ticketService.updateTicketStatus(session.id, TicketStatus.PAID);

    this.logger.log(`Checkout Session completed: ${session.id}`);
  }
}
