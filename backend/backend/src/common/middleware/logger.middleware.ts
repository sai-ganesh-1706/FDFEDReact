import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogFileService } from './log-file.service';

/**
 * LoggerMiddleware — router-level middleware that logs every incoming HTTP
 * request with method, URL, status code, and response time.
 *
 * Applied globally via AppModule.configure() using MiddlewareConsumer.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logFileService: LogFileService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsed = Date.now() - startTime;
      const logLine = `[REQUEST] ${method} ${originalUrl} ${statusCode} — ${elapsed}ms`;

      // Print to console
      console.log(logLine);

      // Write to log file (buffered, flushed every 5 min)
      this.logFileService.writeAppLog(logLine);
    });

    next();
  }
}
