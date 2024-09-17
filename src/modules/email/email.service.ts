import { Injectable } from '@nestjs/common';
import { QUEUE_TYPES } from 'src/constants';
import { RabbitMQClientService } from '../rabbitmq/rabbitmq.service';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class EmailService {
  constructor(private readonly rabbitMQClientService: RabbitMQClientService) {}

  async sendEmail(options: SendMailDto): Promise<void> {
    await this.rabbitMQClientService.sendQueue(
      QUEUE_TYPES.email_queue,
      options,
    );
  }
}
