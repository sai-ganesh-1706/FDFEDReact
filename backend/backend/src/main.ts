import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LogFileService } from './common/middleware/log-file.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  // Profile data can carry base64 images, so allow larger JSON bodies than the 100kb default.
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { limit: '5mb', extended: true });

  // Enable CORS for all frontend origins
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-role, x-user-id, x-college-id',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global error-handling filter — catches ALL exceptions and writes to log files
  const logFileService = app.get(LogFileService);
  app.useGlobalFilters(new AllExceptionsFilter(logFileService));

  // Serve Swagger documentation from static JSON file
  const fs = require('fs');
  const path = require('path');
  const swaggerFilePath = path.join(process.cwd(), 'docs', 'swagger.json');
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));

  SwaggerModule.setup('api', app, swaggerDocument, {
    customSiteTitle: 'CareerNest API Documentation',
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info { margin: 20px 0 }',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 CareerNest API running at http://localhost:3000');
  console.log('📖 Swagger docs at http://localhost:3000/api');
}
bootstrap();
