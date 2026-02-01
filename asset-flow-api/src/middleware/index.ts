import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function applyMiddlewares(app: INestApplication<any>) {
  const configService = app.get(ConfigService);
  
  // Security headers
  app.use(helmet());
  
  // CORS for frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });
}