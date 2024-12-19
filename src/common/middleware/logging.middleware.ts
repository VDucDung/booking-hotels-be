import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logsPath = path.resolve(process.cwd(), 'logs');
  private readonly bugsPath = path.resolve(process.cwd(), 'bugs');

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

  async use(req: Request, res: Response, next: NextFunction) {
    (req as any).bugsPath = this.bugsPath;
    const startTime = Date.now();
    const originalSend = res.send;

    const date = new Date().toISOString();
    const method = req.method;
    const ip = req.ip;
    const user = (req as any).user?.email || 'Anonymous';
    const originalUrl = req.originalUrl;

    const logEntry = {
      date,
      method,
      ip,
      user,
      path: originalUrl,
      query: req.query,
      body: req.body,
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
