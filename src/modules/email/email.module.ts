import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
