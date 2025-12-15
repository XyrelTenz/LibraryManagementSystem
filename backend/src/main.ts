import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix("api");

  // Enabled CORS
  app.enableCors();

  await app.listen(process.env.PORT ??= "");
}
bootstrap();
