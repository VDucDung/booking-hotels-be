import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logsPath = path.resolve(process.cwd(), 'logs');
  private readonly bugsPath = path.resolve(process.cwd(), 'bugs');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    this.ensureDirectoryExistence(this.logsPath, 'logsPath');
    this.ensureDirectoryExistence(this.bugsPath, 'bugsPath');
  }

  private ensureDirectoryExistence(dirPath: string, dirName: string) {
    if (!dirPath || typeof dirPath !== 'string') {
      console.error(`Invalid path for ${dirName}: ${dirPath}`);
      throw new Error(`Invalid path for ${dirName}: ${dirPath}`);
    }
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (err) {
        console.error(`Failed to create directory for ${dirName}: ${err}`);
        throw err;
      }
    }
  }

  private getClientIP(req: Request): string {
    // Nếu đang ở môi trường production
    if (this.isProduction) {
      return (
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-forwarded-for']
          ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
          : '') ||
        (req.headers['x-real-ip'] as string) ||
        (req.headers['x-client-ip'] as string) ||
        req.ip ||
        'unknown'
      );
    }

    // Nếu đang ở môi trường development
    const ip = req.ip || 'unknown';
    // Chuyển đổi IPv6 localhost thành dạng dễ đọc hơn
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return ip;
  }

  private getUserEmail(req: Request): string {
    return (
      (req as any).user?.email ||
      req.body?.email ||
      (req.headers['x-user-email'] as string) ||
      (req.headers['user-email'] as string) ||
      'Anonymous'
    );
  }

  async use(req: Request, res: Response, next: NextFunction) {
    (req as any).bugsPath = this.bugsPath;
    const startTime = Date.now();
    const originalSend = res.send;

    const date = new Date().toISOString();
    const method = req.method;
    const ip = this.getClientIP(req);
    const user = this.getUserEmail(req);
    const originalUrl = req.originalUrl;

    const logEntry = {
      date,
      method,
      ip,
      user,
      path: originalUrl,
      query: req.query,
      body: req.body,
      environment: this.isProduction ? 'production' : 'development',
    };

    try {
      fs.appendFileSync(
        path.join(
          this.logsPath,
          `${new Date().toISOString().split('T')[0]}.log`,
        ),
        JSON.stringify(logEntry) + '\n',
      );
    } catch (err) {
      console.error('Error writing to logs:', err);
    }

    res.send = function (body) {
      const responseTime = Date.now() - startTime;

      let responseBody;
      try {
        responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (err) {
        responseBody = { message: 'Invalid response body format' };
      }

      const statusCodeFromBody = responseBody?.statusCode || res.statusCode;
      const bugsPath = (req as any).bugsPath;
      if (statusCodeFromBody >= 400) {
        const errorEntry = {
          date,
          method,
          ip,
          user,
          path: originalUrl,
          statusCode: statusCodeFromBody,
          error: responseBody,
          responseTime,
          environment: this.isProduction ? 'production' : 'development',
        };

        try {
          fs.appendFileSync(
            path.join(
              bugsPath,
              `${new Date().toISOString().split('T')[0]}.log`,
            ),
            JSON.stringify(errorEntry) + '\n',
          );
        } catch (err) {
          console.error('Error writing to bugs log:', err);
        }
      }

      return originalSend.call(this, body);
    };

    next();
  }
}
