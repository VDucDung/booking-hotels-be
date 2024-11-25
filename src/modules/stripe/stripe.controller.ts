import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  Get,
  Delete,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-stripe.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import Stripe from 'stripe';
import { ErrorHelper } from 'src/common/helpers';
import { TransactionService } from 'src/transactions/transactions.service';
import { TransactionStatus } from 'src/enums/transaction.enum';
import { UserService } from '../users/user.service';
import { TicketService } from '../tickets/ticket.service';
import { TicketStatus } from 'src/enums/ticket.enum';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
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
    @Body() body: { ticketId: string; hotelOwnerId: number; amount: number },
  ) {
    return this.stripeService.createBookingPaymentIntent({
      ticketId: body.ticketId,
      user,
      hotelOwnerId: body.hotelOwnerId,
      amount: body.amount,
    });
  }

  @Post('/create-stripe-account')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createStripeAccount(@UserDecorator() user: User) {
    return this.stripeService.createConnectedAccount(user);
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
          paymentIntent.id,
          TransactionStatus.SUCCESS,
        );
        await this.ticketService.updateTicketStatus(
          paymentIntent.id,
          TicketStatus.PAID,
        );
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        const user = await this.userService.getUserById(+userId);

        if (!user) {
          ErrorHelper.NotFoundException('User not found');
        }

        const newBalance = (user.balance || 0) + session.amount_total;

        await this.userService.updateUserById(+userId, {
          balance: newBalance,
        });

        await this.transactionService.updateTransactionStatus(
          session.id,
          TransactionStatus.SUCCESS,
        );

        await this.ticketService.updateTicketStatus(
          session.id,
          TicketStatus.PAID,
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
