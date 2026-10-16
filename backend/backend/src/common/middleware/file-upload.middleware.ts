import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require('multer') as typeof import('multer');
import type multerType from 'multer';
import * as path from 'path';
import * as fs from 'fs';

/**
 * FileUploadMiddleware — router-level middleware using multer for file uploads.
 *
 * Configuration:
 *   - Storage: disk (uploads/ directory)
 *   - Allowed types: image/jpeg, image/png, image/gif, application/pdf
 *   - Max file size: 5 MB
 *   - Max files per request: 1
 *
 * Applied via MiddlewareConsumer to specific upload routes.
 */
@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private readonly upload: multerType.Multer;

  constructor() {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, uniqueName);
      },
    });

    this.upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, gif, pdf`));
        }
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.upload.single('file')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'File upload failed';
        res.status(400).json({ statusCode: 400, message, error: 'Bad Request' });
        return;
      }
      next();
    });
  }
}
