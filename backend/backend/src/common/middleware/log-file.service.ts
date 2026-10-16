import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * LogFileService — buffers log/error lines in memory and flushes them to
 * date-stamped files every LOG_FLUSH_INTERVAL_MS (default: 5 minutes).
 *
 * Files written:
 *   logs/app-YYYY-MM-DD.log   — general request logs
 *   logs/error-YYYY-MM-DD.log — error / exception logs
 */
@Injectable()
export class LogFileService implements OnModuleInit, OnModuleDestroy {
  private readonly LOG_DIR = path.join(process.cwd(), 'logs');
  private readonly FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  private appBuffer: string[] = [];
  private errorBuffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  onModuleInit() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.LOG_DIR)) {
      fs.mkdirSync(this.LOG_DIR, { recursive: true });
    }

    // Start the periodic flush timer
    this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
  }

  onModuleDestroy() {
    // Flush remaining buffer on shutdown
    this.flush();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  /** Append a general application log line */
  writeAppLog(line: string) {
    this.appBuffer.push(`${new Date().toISOString()} ${line}`);
    // Also flush immediately if buffer is large
    if (this.appBuffer.length >= 100) {
      this.flush();
    }
  }

  /** Append an error log line */
  writeErrorLog(line: string) {
    this.errorBuffer.push(`${new Date().toISOString()} ${line}`);
    // Errors are flushed immediately so nothing is lost
    this.flush();
  }

  /** Write buffered lines to disk */
  flush() {
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (this.appBuffer.length > 0) {
      const appFile = path.join(this.LOG_DIR, `app-${dateStr}.log`);
      fs.appendFileSync(appFile, this.appBuffer.join('\n') + '\n', 'utf8');
      this.appBuffer = [];
    }

    if (this.errorBuffer.length > 0) {
      const errorFile = path.join(this.LOG_DIR, `error-${dateStr}.log`);
      fs.appendFileSync(errorFile, this.errorBuffer.join('\n') + '\n', 'utf8');
      this.errorBuffer = [];
    }
  }
}
