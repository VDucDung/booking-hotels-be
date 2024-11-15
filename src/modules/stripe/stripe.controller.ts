import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-stripe.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

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
}
