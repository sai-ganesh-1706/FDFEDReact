import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogFileService } from '../middleware/log-file.service';

/**
 * AllExceptionsFilter — Advanced Global Exception and Error-Handling Middleware.
 *
 * Catches ALL exceptions (HTTP Exceptions, Validation Pipe Errors, DB/Conflict errors,
 * and System/Runtime crashes like TypeErrors) and categorizes them with specific logs.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logFileService: LogFileService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let category = 'SYSTEM_CRASH'; // Default category for unhandled/runtime exceptions

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Categorize HTTP errors
      if (statusCode === HttpStatus.BAD_REQUEST) {
        category = 'VALIDATION_ERROR';
      } else if (statusCode === HttpStatus.UNAUTHORIZED || statusCode === HttpStatus.FORBIDDEN) {
        category = 'SECURITY_AUDIT';
      } else if (statusCode === HttpStatus.NOT_FOUND) {
        category = 'NOT_FOUND_ERROR';
      } else if (statusCode === HttpStatus.CONFLICT) {
        category = 'CONFLICT_ERROR';
      } else {
        category = 'API_ERROR';
      }

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string | string[]) ?? message;
        error = (resp['error'] as string) ?? exception.name;
      }
    } else if (exception instanceof Error) {
      // Handles native JavaScript/Node errors (e.g., TypeError, ReferenceError)
      message = exception.message;
      error = exception.name;
      
      // Categorize runtime exceptions
      if (exception instanceof TypeError) {
        category = 'TYPE_ERROR';
      } else if (exception instanceof ReferenceError) {
        category = 'REFERENCE_ERROR';
      } else if (exception.message.includes('unique') || exception.message.includes('duplicate')) {
        category = 'DATABASE_CONFLICT';
        statusCode = HttpStatus.CONFLICT;
      }
    }

    const timestamp = new Date().toISOString();
    const path = request.url;

    // Format error log line for storage in error-*.log file
    const messageStr = Array.isArray(message) ? message.join('; ') : message;
    const stackTrace = exception instanceof Error ? (exception.stack ?? 'N/A') : 'N/A';
    
    const errorLogLine = 
      `[${category}] [Status: ${statusCode}] [${error}] | ` +
      `${request.method} ${path} | ` +
      `Message: "${messageStr}" | ` +
      `Stack: ${stackTrace.replace(/\r?\n|\r/g, ' -> ')}`; // Keep logs single-line for easier parsing

    // Save log immediately
    this.logFileService.writeErrorLog(errorLogLine);

    // Also write to terminal console for local debugging
    console.error(`🔴 [${category}] ${request.method} ${path} - Status ${statusCode} - ${messageStr}`);
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    // Clean response for client consumption
    response.status(statusCode).json({
      statusCode,
      message: Array.isArray(message) ? message : [message], // Always normalize validation details to an array
      error,
      category,
      path,
      timestamp,
    });
  }
}
