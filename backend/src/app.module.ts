import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

// Route Module
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BookModule } from './book/book.module';
import { BorrowingModule } from './borrowing/borrowing.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    NotificationsModule,
    BookModule,
    BorrowingModule
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
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
