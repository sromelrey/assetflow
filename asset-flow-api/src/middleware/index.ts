import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function applyMiddlewares(app: INestApplication<any>) {
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS for frontend
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    ...(corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : []),
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });
}
