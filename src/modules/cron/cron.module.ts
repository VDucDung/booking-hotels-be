import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from '../telegram/telegram.module';
import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), TelegramModule],
  providers: [CronService],
})
export class CronModule {}
