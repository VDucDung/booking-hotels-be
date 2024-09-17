import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQClientService } from './rabbitmq.service';
import { RabbitMQConfig } from 'src/config';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQClientService, RabbitMQConfig],
  exports: [RabbitMQClientService],
})
export class RabbitMQModule {}
