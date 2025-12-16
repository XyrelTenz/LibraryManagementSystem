import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix("api");

  // Enabled CORS
  app.enableCors();


  // Convert String into Number base on DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  await app.listen(process.env.PORT ??= "");
}
bootstrap();
