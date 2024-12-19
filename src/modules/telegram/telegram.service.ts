import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorEntry } from 'src/interfaces/error-entry.interface';
import { LogEntry } from 'src/interfaces/log-entry.interface';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly logsBot: string;
  private readonly bugsBot: string;
  private readonly chatId: string;

  constructor(private configService: ConfigService) {
    this.logsBot = this.configService.get<string>('TELEGRAM_LOGS_BOT_TOKEN');
    this.bugsBot = this.configService.get<string>('TELEGRAM_BUGS_BOT_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
  }

  async sendLogsToTelegram() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logsPath = path.resolve(process.cwd(), 'logs', `${today}.log`);

      if (fs.existsSync(logsPath)) {
        const logs = fs.readFileSync(logsPath, 'utf-8');
        const logEntries: LogEntry[] = logs
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (e) {
              this.logger.error(`Error parsing log entry: ${line}`, e);
              return null;
            }
          })
          .filter((entry) => entry !== null);

        for (const entry of logEntries) {
          const message = `
📝 User Activity Log
📅 Date: ${entry.date}
👤 User: ${entry.user}
🌐 IP: ${entry.ip}
📍 Path: ${entry.path}
🔧 Method: ${entry.method}
          `;

          await axios.post(
            `https://api.telegram.org/bot${this.logsBot}/sendMessage`,
            {
              chat_id: this.chatId,
              text: message,
              parse_mode: 'HTML',
            },
          );

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        fs.unlinkSync(logsPath);
      } else {
        this.logger.warn(`Log file not found: ${logsPath}`);
      }
    } catch (error) {
      this.logger.error('Error sending logs to Telegram:', error);
    }
  }

  async sendBugsToTelegram() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const bugsPath = path.resolve(process.cwd(), 'bugs', `${today}.log`);

      if (fs.existsSync(bugsPath)) {
        const bugs = fs.readFileSync(bugsPath, 'utf-8');
        const bugEntries: ErrorEntry[] = bugs
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (e) {
              this.logger.error(`Error parsing bug entry: ${line}`, e);
              return null;
            }
          })
          .filter((entry) => entry !== null);

        for (const entry of bugEntries) {
          const message = `
🐛 Error Report
📅 Date: ${entry.date}
👤 User: ${entry.user}
🌐 IP: ${entry.ip}
📍 Path: ${entry.path}
🔧 Method: ${entry.method}
❌ Status: ${entry.statusCode}
⚠️ Error: ${JSON.stringify(entry.error)}
⏱️ Response Time: ${entry.responseTime}ms
          `;

          await axios.post(
            `https://api.telegram.org/bot${this.bugsBot}/sendMessage`,
            {
              chat_id: this.chatId,
              text: message,
              parse_mode: 'HTML',
            },
          );

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        fs.unlinkSync(bugsPath);
      } else {
        this.logger.warn(`Bug file not found: ${bugsPath}`);
      }
    } catch (error) {
      this.logger.error('Error sending bugs to Telegram:', error);
    }
  }
}
