import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applyMiddlewares } from '@/middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Apply middlewares (cors, helmet, etc.)
  applyMiddlewares(app);
  
  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT')) || 3000;
  
  // Swagger configuration with Bearer Auth
  const config = new DocumentBuilder()
    .setTitle('API Starter (JWT)')
    .setDescription('API Starter with JWT Authentication')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);
  
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();