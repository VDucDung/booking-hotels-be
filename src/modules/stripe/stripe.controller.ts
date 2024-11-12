// src/stripe/stripe.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-stripe.dto';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string },
  ) {
    const { amount, currency } = body;
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
    );
    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    const session = await this.stripeService.createCheckoutSession(
      createCheckoutSessionDto.amount,
    );
    return { sessionId: session.id };
  }
}
