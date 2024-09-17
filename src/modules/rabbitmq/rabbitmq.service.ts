import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConfig } from 'src/config';

@Injectable()
export class RabbitMQClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQClientService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueURL: string;

  constructor(private readonly rabbitMQConfig: RabbitMQConfig) {
    this.queueURL = this.rabbitMQConfig.uri;
  }

  async onModuleInit() {
    await this.establishConnection();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async establishConnection(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(this.queueURL);
        this.channel = await this.connection.createChannel();
      }
    } catch (error) {
      this.logger.error('Error establishing connection to RabbitMQ:', error);
      throw error;
    }
  }

  async sendQueue(queueName: string, data: any): Promise<void> {
    try {
      await this.establishConnection();
      if (!this.channel) {
        throw new Error('Channel is not established.');
      }
      await this.channel.assertQueue(queueName, { durable: true });
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
        persistent: true,
      });
    } catch (error) {
      this.logger.error('Error sending message to RabbitMQ queue:', error);
      throw error;
    }
  }

  private async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
      throw error;
    } finally {
      this.connection = null;
      this.channel = null;
    }
  }
}
