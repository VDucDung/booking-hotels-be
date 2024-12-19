import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleLogsCron() {
    try {
      this.logger.debug('Running logs cron job...');
      await this.telegramService.sendLogsToTelegram();
    } catch (error) {
      this.logger.error('Error in logs cron job:', error);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleBugsCron() {
    try {
      this.logger.debug('Running bugs cron job...');
      await this.telegramService.sendBugsToTelegram();
    } catch (error) {
      this.logger.error('Error in bugs cron job:', error);
    }
  }
}
