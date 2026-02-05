import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function applyMiddlewares(app: INestApplication<any>) {
  const configService = app.get(ConfigService);
  
  // Security headers
  app.use(helmet());
  
  // CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });
}