import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

// Main Routes
import { RoutesModule } from './routes/routes.module';
import { AuthorModule } from './author/author.module';

@Module({
  imports: [
    RoutesModule,
    AuthorModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
