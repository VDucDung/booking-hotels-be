import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQConfig {
  private readonly host: string = process.env.RABBITMQ_HOST || '';
  private readonly vhost: string = process.env.RABBITMQ_VHOST || '';
  private readonly port: number = Number(process.env.RABBITMQ_PORT) || 5672;
  private readonly username: string = process.env.RABBITMQ_USERNAME || '';
  private readonly password: string = process.env.RABBITMQ_PASSWORD || '';
  private readonly type: 'cloud' | 'local' =
    (process.env.RABBITMQ_TYPE as 'cloud' | 'local') || 'cloud';

  get uri(): string {
    return this.type === 'cloud'
      ? `amqps://${this.username}:${this.password}@${this.host}/${this.vhost}`
      : `amqp://${this.username}:${this.password}@${this.host}:${this.port}/${this.vhost}`;
  }
}
